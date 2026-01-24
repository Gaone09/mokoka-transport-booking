-- ROUTES
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- ROUTE STOPS (new update)
CREATE TABLE route_stops (
    id SERIAL PRIMARY KEY,
    route_id INT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    stop_name TEXT NOT NULL
);

-- TRIPS
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    route_id INT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0)
);

-- BOOKINGS
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(id),
    pickup TEXT NOT NULL,
    dropoff TEXT NOT NULL,
    travel_date DATE NOT NULL,
    seats INT NOT NULL CHECK (seats > 0),
    booking_ref TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

