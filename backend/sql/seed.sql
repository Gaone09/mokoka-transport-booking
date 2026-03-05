-- ─────────────────────────────────────────────────────────────────────────────
-- Jones Coaches — Seed Data
-- Run AFTER schema.sql:
--   psql -U mokoka_admin -d mokoka_transport -f sql/seed.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Routes
INSERT INTO routes (name) VALUES
  ('Gaborone → Maun'),
  ('Maun → Gaborone'),
  ('Francistown → Gaborone')
ON CONFLICT DO NOTHING;

-- Route stops
INSERT INTO route_stops (route_id, stop_order, stop_name) VALUES
  (1, 1, 'Gaborone'), (1, 2, 'Palapye'), (1, 3, 'Maun'),
  (2, 1, 'Maun'),     (2, 2, 'Palapye'), (2, 3, 'Gaborone'),
  (3, 1, 'Francistown'), (3, 2, 'Gaborone')
ON CONFLICT DO NOTHING;

-- Trips
INSERT INTO trips (route_id, departure_time, capacity) VALUES
  (1, '04:30', 62),
  (1, '18:00', 72),
  (2, '09:30', 62),
  (2, '18:00', 72),
  (3, '05:30', 62)
ON CONFLICT DO NOTHING;

-- Admin user (password: Admin@1234 — CHANGE THIS in production!)
-- bcrypt hash of "Admin@1234" with cost 12
INSERT INTO users (name, email, password, role) VALUES (
  'Admin',
  'admin@jonescoaches.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcCoMmPY/e7vLDi',
  'admin'
) ON CONFLICT (email) DO NOTHING;