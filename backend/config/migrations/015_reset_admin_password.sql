INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    points,
    check_in_unlocked,
    confirmed_orders
) VALUES (
    'Administradora Essence Fit',
    'admin@essencefit.com.br',
    '$2b$10$ItNRu8Wyz.tX0toNq4duDu78dkGzudlSZuuIbh19V5sFtLPuCkv/a',
    'ADMIN',
    0,
    TRUE,
    0
) ON CONFLICT (email) DO UPDATE
SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = 'ADMIN',
    check_in_unlocked = TRUE,
    updated_at = NOW();
