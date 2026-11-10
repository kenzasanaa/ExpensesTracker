// src/lib/api.ts
// The ONLY file in the frontend that knows the backend exists.
// It translates DB vocabulary (txn_date, category_id) → frontend vocabulary (date, category, paymentMode).

import type { Transaction } from '@/types/transaction';

const BASE = 'http://localhost:3001';

/** One row exactly as the backend returns it (after the SQL JOINs). */
interface TransactionRow {
  id: string;
  type: 'income' | 'expense';
  amount: string;           // NUMERIC arrives as a string from pg — convert with Number()
  description: string;
  txn_date: string;         // 'YYYY-MM-DD'
  txn_time: string | null;
  category_id: number;
  category: string;         // JOINed name
  payment_mode_id: number;
  payment_mode: string;     // JOINed name
  created_at: string;
  updated_at: string;
}

export interface BalanceHistoryRow {
  txn_date: string;
  total_income: number;
  total_expense: number;
  net_balance: number;
  running_balance: number;
}

export interface Lookups {
  categories: { id: number; name: string }[];
  payment_modes: { id: number; name: string }[];
}

export interface Stats {
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category: string;
  transaction_count: number;
  total_amount: number;
}

export interface ListResult {
  rows: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** 'YYYY-MM-DD' in LOCAL time. (toISOString() uses UTC and can shift the day backwards.) */
export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** DB row → frontend Transaction. The seam translates vocabularies. */
export function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    category: row.category as Transaction['category'],        // ← cast
    paymentMode: row.payment_mode as Transaction['paymentMode'], // ← cast
    date: new Date(`${row.txn_date}T00:00:00`),
  };
}
// Lookups, cached for the session — forms and filters need name ↔ id resolution
let lookupsCache: Lookups | null = null;
export async function getLookups(): Promise<Lookups> {
  if (!lookupsCache) lookupsCache = await request<Lookups>('/api/lookups');
  return lookupsCache;
}

/** Frontend Transaction → backend body. Names become ids via the lookups. */
async function toApiBody(t: Omit<Transaction, 'id'>) {
  const { categories, payment_modes } = await getLookups();
  return {
    type: t.type,
    amount: t.amount,
    description: t.description,
    txn_date: fmtDate(t.date),
    txn_time: null,
    category_id: categories.find((c) => c.name === t.category)?.id,
    payment_mode_id: payment_modes.find((m) => m.name === t.paymentMode)?.id,
  };
}

export const api = {
  async list(params: URLSearchParams): Promise<ListResult> {
    const data = await request<Omit<ListResult, 'rows'> & { rows: TransactionRow[] }>(
      `/api/transactions?${params.toString()}`
    );
    return { ...data, rows: data.rows.map(mapRow) };
  },

  stats(from: string, to: string): Promise<Stats> {
    return request<Stats>(`/api/stats?from=${from}&to=${to}`);
  },

  categoryBreakdown(from: string, to: string): Promise<CategoryBreakdown[]> {
    return request<CategoryBreakdown[]>(`/api/stats/categories?from=${from}&to=${to}`);
  },

  async create(t: Omit<Transaction, 'id'>): Promise<void> {
    await request('/api/transactions', { method: 'POST', body: JSON.stringify(await toApiBody(t)) });
  },

  async update(id: string, t: Omit<Transaction, 'id'>): Promise<void> {
    await request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(await toApiBody(t)) });
  },
  balanceHistory(from: string, to: string): Promise<BalanceHistoryRow[]> {
    return request<BalanceHistoryRow[]>(`/api/stats/balance?from=${from}&to=${to}`);
  },
  removeMany(ids: string[]): Promise<{ deleted: number }> {
    return request('/api/transactions', { method: 'DELETE', body: JSON.stringify({ ids }) });
  },
};