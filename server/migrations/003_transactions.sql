-- 003_transactions.sql — the core fact table
-- Every CHECK below mirrors a Zod rule from src/types/transaction.ts,
-- so invalid data is rejected even if it bypasses the client.

CREATE TABLE transactions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id)           ON DELETE CASCADE,
    category_id     SMALLINT     NOT NULL REFERENCES categories(id),
    payment_mode_id SMALLINT     NOT NULL REFERENCES payment_modes(id),
    type            VARCHAR(10)  NOT NULL CHECK (type IN ('income', 'expense')),        -- z.enum(['income','expense'])
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0 AND amount <= 999999),    -- .positive().max(999999)
    txn_date        DATE         NOT NULL,                                             -- date filter on the dashboard
    txn_time        TIME,                                                               -- optional, kept as "HH:MM"
    description     VARCHAR(100) NOT NULL CHECK (char_length(trim(description)) >= 2),  -- .min(2).max(100)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE transactions IS 'One row per income/expense entry, owned by a user.';
COMMENT ON COLUMN transactions.amount IS 'NUMERIC, never float — exact decimal arithmetic for money.';

-- Composite index serves the master date filter: WHERE user_id = $1 AND txn_date BETWEEN $2 AND $3
CREATE INDEX idx_transactions_user_date ON transactions (user_id, txn_date DESC);
CREATE INDEX idx_transactions_category   ON transactions (category_id);