-- 001_users.sql — user accounts
-- Passwords are stored ONLY as bcrypt hashes (see report section "Безопасность/хеширование").
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- provides gen_random_uuid()

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    name          VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS 'Application users — one row per registered account.';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash, format $2b$10$<salt><digest>. Plain text is never stored.';