CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'customer',
    points INTEGER NOT NULL DEFAULT 0,
    check_in_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    confirmed_orders INTEGER NOT NULL DEFAULT 0,
    preferred_activity VARCHAR(60),
    preferred_season VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
