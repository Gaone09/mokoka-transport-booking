CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    route_id INT REFERENCES routes(id),
    departure_time TIME NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    trip_id INT REFERENCES trips(id),
    pickup TEXT NOT NULL,
    dropoff TEXT NOT NULL,
    travel_date DATE NOT NULL,
    seats INT NOT NULL CHECK (seats > 0),
    booking_ref TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

