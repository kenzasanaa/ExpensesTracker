-- 004_triggers.sql

-- 1) Generic trigger: keep updated_at in sync on every UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2) Business rule moved from client to DB.
-- Previously: Zod .refine() in transactionFormSchema (client only).
-- Now the rule is enforced inside PostgreSQL, so NO client can violate it,
-- including psql, scripts or a future mobile app.
CREATE OR REPLACE FUNCTION enforce_extra_income_rule() RETURNS trigger AS $$
BEGIN
    IF NEW.type <> 'income'
       AND EXISTS (SELECT 1 FROM categories
                   WHERE id = NEW.category_id AND name = 'Extra Income') THEN
        RAISE EXCEPTION 'Category "Extra Income" can only be used with type ''income'' (transaction %)', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_extra_income_rule
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION enforce_extra_income_rule();