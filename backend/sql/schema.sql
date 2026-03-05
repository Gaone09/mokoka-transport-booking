-- ─────────────────────────────────────────────────────────────────────────────
-- Jones Coaches — Full Schema
-- Run: psql -U mokoka_admin -d mokoka_transport -f sql/schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    role       VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
    created_at TIMESTAMP DEFAULT NOW()
);

-- REFRESH TOKENS (for JWT rotation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- ROUTE STOPS
CREATE TABLE IF NOT EXISTS route_stops (
    id         SERIAL PRIMARY KEY,
    route_id   INT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    stop_name  TEXT NOT NULL
);

-- TRIPS
CREATE TABLE IF NOT EXISTS trips (
    id             SERIAL PRIMARY KEY,
    route_id       INT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    capacity       INT NOT NULL CHECK (capacity > 0),
    status         VARCHAR(20) NOT NULL DEFAULT 'scheduled' -- 'scheduled' | 'cancelled' | 'completed'
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id             SERIAL PRIMARY KEY,
    trip_id        INT NOT NULL REFERENCES trips(id),
    user_id        INT REFERENCES users(id),          -- nullable for legacy rows
    pickup         TEXT NOT NULL,
    dropoff        TEXT NOT NULL,
    travel_date    DATE NOT NULL,
    seats          INT NOT NULL CHECK (seats > 0),
    booking_ref    TEXT UNIQUE NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED' | 'CANCELLED' | 'SCANNED'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',   -- 'pending' | 'paid'
    created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id    ON bookings(trip_id);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id         SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    provider   VARCHAR(50),
    amount     NUMERIC,
    status     VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);