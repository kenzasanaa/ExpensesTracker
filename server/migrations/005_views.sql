-- 005_views.sql — ready-made aggregates consumed by the API

-- Feeds the dashboard metric cards: Net Balance, Total Income, Total Expenses.
CREATE VIEW v_daily_stats AS
SELECT
    t.user_id,
    t.txn_date,
    COUNT(*)                                                    AS transaction_count,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'),  0) AS total_income,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS total_expense,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'),  0)
        - COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS net_balance
FROM transactions t
GROUP BY t.user_id, t.txn_date;

COMMENT ON VIEW v_daily_stats IS 'Per-user per-day totals; consumed by GET /api/stats.';

-- Feeds the categorical doughnut chart.
CREATE VIEW v_category_breakdown AS
SELECT
    t.user_id,
    c.name  AS category,
    t.type,
    COUNT(*)                     AS transaction_count,
    COALESCE(SUM(t.amount), 0)   AS total_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
GROUP BY t.user_id, c.name, t.type;

COMMENT ON VIEW v_category_breakdown IS 'Per-user per-category totals; consumed by the dashboard doughnut chart.';