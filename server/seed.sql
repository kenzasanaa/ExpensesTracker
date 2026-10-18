-- seed.sql — run AFTER all migrations. Demo data for development and screenshots.
-- Demo login: demo@expensetracker.dev / password123
-- Regenerate the hash any time with:
--   node -e "console.log(require('bcryptjs').hashSync('password123', 10))"

INSERT INTO categories (name) VALUES
    ('Rent'), ('Food'), ('Transportation'), ('Groceries'), ('Bills'),
    ('Clothing'), ('Shopping'), ('Education'), ('Extra Income'), ('Others');

INSERT INTO payment_modes (name) VALUES
    ('Cash'), ('Credit Card'), ('Debit Card'), ('Bank Transfer');

INSERT INTO users (email, password_hash, name) VALUES
    ('demo@expensetracker.dev', '$2b$10$VodTjOs4k4hle/ncOBnNMuC.QeaHBTYjT2KscW/.FE8p2bZLL3EcG', 'Demo User');

-- ~150 realistic transactions for the demo user, spread over the last 90 days.
INSERT INTO transactions (user_id, category_id, payment_mode_id, type, amount, txn_date, txn_time, description)
SELECT
    u.id,
    CASE WHEN s.type = 'income' THEN 9                                   -- 'Extra Income'
         ELSE (ARRAY[1,2,3,4,5,6,7,8,10])[floor(random() * 9 + 1)]::int   -- any except 9
    END AS category_id,
    s.payment_mode_id,
    s.type,
    s.amount,
    CURRENT_DATE - (random() * 90)::int                                  AS txn_date,
    (time '07:00' + (random() * 840) * interval '1 minute')::time(0)     AS txn_time,
    CASE WHEN s.type = 'income'
         THEN (ARRAY['Salary deposit', 'Freelance payment', 'Cashback reward', 'Marketplace refund'])[floor(random() * 4 + 1)]
         ELSE (ARRAY['Groceries run', 'Metro top-up', 'Electricity bill', 'Coffee with friends',
                     'New shoes', 'Online course', 'Weekend shopping', 'Dinner out',
                     'Pharmacy', 'Household items'])[floor(random() * 10 + 1)]
    END AS description
FROM users u
CROSS JOIN LATERAL (
    SELECT
        CASE WHEN random() < 0.25 THEN 'income' ELSE 'expense' END       AS type,
        floor(random() * 4 + 1)::smallint                                AS payment_mode_id,
        round((random() * 395 + 5)::numeric, 2)                          AS amount
) s
CROSS JOIN generate_series(1, 150) AS g(i)
WHERE u.email = 'demo@expensetracker.dev';