import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { pool } from './db.js';

const app = express();
app.use(cors());          // allow calls from the Vite dev server
app.use(express.json());  // parse JSON request bodies

// ── TEMPORARY (real login/JWT replaces this later) ──
// "Whose data?" — pinned to the demo user from seed.sql for now.
// EVERY handler below uses req.userId. When auth arrives, only this changes.
async function attachDemoUser(req, res, next) {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE email = 'demo@expensetracker.dev'"
  );
  if (!rows[0]) return res.status(500).json({ error: 'Demo user missing — run seed.sql' });
  req.userId = rows[0].id;
  next();
}

// The same rules as the frontend Zod schema — validation lives on BOTH
// sides of the wire. Client validation = UX. Server validation = law.
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive().max(999999),
  txn_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // 'YYYY-MM-DD'
  txn_time: z.string().regex(/^\d{2}:\d{2}$/).nullish(),
  description: z.string().trim().min(2).max(100),
  category_id: z.coerce.number().int().positive(),
  payment_mode_id: z.coerce.number().int().positive(),
});

// ── Health check ──
app.get('/api/health', async (req, res, next) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); }
  catch (err) { next(err); }
});

// ── Lookups: feeds the form's category/payment-mode dropdowns ──
app.get('/api/lookups', async (req, res, next) => {
  try {
    const [cats, modes] = await Promise.all([
      pool.query('SELECT id, name FROM categories ORDER BY id'),
      pool.query('SELECT id, name FROM payment_modes ORDER BY id'),
    ]);
    res.json({ categories: cats.rows, payment_modes: modes.rows });
  } catch (err) { next(err); }
});

// ── List: date range + multi-select filters + pagination ──
app.get('/api/transactions', attachDemoUser, async (req, res, next) => {
  try {
    const { from, to, type, search, min, max, page = 1, pageSize = 10 } = req.query;
    const where = ['t.user_id = $1'];
    const params = [req.userId];
    const add = (cond, val) => { params.push(val); where.push(cond.replace('?', `$${params.length}`)); };

    if (from) add('t.txn_date >= ?', from);
    if (to)   add('t.txn_date <= ?', to);
    if (type === 'income' || type === 'expense') add('t.type = ?', type);
    if (min) add('t.amount >= ?', min);
    if (max) add('t.amount <= ?', max);
    if (search) {
      params.push(`%${search}%`);
      // matches your UI: searches description OR category name
      where.push(`(t.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
    }

    // Multi-select filters arrive as comma-separated ids ("1,3,7")
    const categoryIds = req.query.category_ids ? String(req.query.category_ids).split(',').map(Number).filter(Boolean) : [];
    if (categoryIds.length) { params.push(categoryIds); where.push(`t.category_id = ANY($${params.length})`); }
    const modeIds = req.query.payment_mode_ids ? String(req.query.payment_mode_ids).split(',').map(Number).filter(Boolean) : [];
    if (modeIds.length) { params.push(modeIds); where.push(`t.payment_mode_id = ANY($${params.length})`); }

    const fromSql = 'FROM transactions t JOIN categories c ON c.id = t.category_id JOIN payment_modes p ON p.id = t.payment_mode_id';
    const whereSql = 'WHERE ' + where.join(' AND ');

    const { rows: [count] } = await pool.query(`SELECT COUNT(*)::int AS total ${fromSql} ${whereSql}`, params);

    params.push(pageSize, (page - 1) * pageSize);
    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category, p.name AS payment_mode
       ${fromSql}
       ${whereSql}
       ORDER BY t.txn_date DESC, t.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);

    res.json({ rows, total: count.total, page: Number(page), pageSize: Number(pageSize) });
  } catch (err) { next(err); }
});

// ── One transaction by id (the Edit dialog needs this — with pagination,
//    the frontend only holds one page, so lookup must go through the API) ──
app.get('/api/transactions/:id', attachDemoUser, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, c.name AS category, p.name AS payment_mode
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       JOIN payment_modes p ON p.id = t.payment_mode_id
       WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── Create ──
app.post('/api/transactions', attachDemoUser, async (req, res, next) => {
  try {
    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', issues: parsed.error.issues });
    const d = parsed.data;
    const { rows } = await pool.query(
      `INSERT INTO transactions (user_id, category_id, payment_mode_id, type, amount, txn_date, txn_time, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.userId, d.category_id, d.payment_mode_id, d.type, d.amount, d.txn_date, d.txn_time ?? null, d.description]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// ── Update ──
app.put('/api/transactions/:id', attachDemoUser, async (req, res, next) => {
  try {
    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', issues: parsed.error.issues });
    const d = parsed.data;
    const { rows } = await pool.query(
      `UPDATE transactions SET category_id=$1, payment_mode_id=$2, type=$3, amount=$4,
         txn_date=$5, txn_time=$6, description=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [d.category_id, d.payment_mode_id, d.type, d.amount, d.txn_date, d.txn_time ?? null, d.description, req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── Bulk delete (multi-select ledger feature) ──
app.delete('/api/transactions', attachDemoUser, async (req, res, next) => {
  try {
    const ids = req.body.ids ?? [];
    const { rowCount } = await pool.query(
      'DELETE FROM transactions WHERE user_id = $1 AND id = ANY($2)', [req.userId, ids]);
    res.json({ deleted: rowCount });
  } catch (err) { next(err); }
});

// ── Dashboard metric cards — from YOUR view (005) ──
app.get('/api/stats', attachDemoUser, async (req, res, next) => {
  try {
    const from = req.query.from ?? '2000-01-01';
    const to = req.query.to ?? '2100-01-01';
    const { rows: [s] } = await pool.query(
      `SELECT COALESCE(SUM(total_income),0)::float8  AS total_income,
              COALESCE(SUM(total_expense),0)::float8 AS total_expense,
              COALESCE(SUM(net_balance),0)::float8   AS net_balance,
              COALESCE(SUM(transaction_count),0)::int AS transaction_count
       FROM v_daily_stats WHERE user_id=$1 AND txn_date BETWEEN $2 AND $3`,
      [req.userId, from, to]);
    res.json(s);
  } catch (err) { next(err); }
});

// ── Doughnut chart. v_category_breakdown has no date column, so when the
// question changes we compose our own query — views are a starting point. ──
app.get('/api/stats/categories', attachDemoUser, async (req, res, next) => {
  try {
    const from = req.query.from ?? '2000-01-01';
    const to = req.query.to ?? '2100-01-01';
    const { rows } = await pool.query(
      `SELECT c.name AS category, COUNT(*)::int AS transaction_count, SUM(t.amount)::float8 AS total_amount
       FROM transactions t JOIN categories c ON c.id = t.category_id
       WHERE t.user_id=$1 AND t.type='expense' AND t.txn_date BETWEEN $2 AND $3
       GROUP BY c.name ORDER BY total_amount DESC`, [req.userId, from, to]);
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Balance timeline: cumulative balance per day via window function
//    over v_daily_stats — "computed, never stored." ──
app.get('/api/stats/balance', attachDemoUser, async (req, res, next) => {
  try {
    const from = req.query.from ?? '2000-01-01';
    const to = req.query.to ?? '2100-01-01';
    const { rows } = await pool.query(
      `SELECT txn_date,
              total_income::float8, total_expense::float8, net_balance::float8,
              SUM(net_balance) OVER (ORDER BY txn_date)::float8 AS running_balance
       FROM v_daily_stats
       WHERE user_id = $1 AND txn_date BETWEEN $2 AND $3
       ORDER BY txn_date`,
      [req.userId, from, to]);
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Central error handler: DB rules (CHECKs, triggers, FKs) become HTTP 400s.
//    MUST be the last middleware — it catches errors from ALL routes above. ──
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ error: 'Already exists (unique violation)' });
  if (err.code === '23503') return res.status(400).json({ error: 'Reference to a non-existent category/mode/user' });
  if (err.code === '23514' || err.code === 'P0001') return res.status(400).json({ error: err.message }); // CHECK / trigger raise
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API ready → http://localhost:${PORT}/api/health`));