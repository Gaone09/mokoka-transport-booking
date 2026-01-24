-- Routes
INSERT INTO routes (name) VALUES
('Gaborone → Maun'),
('Maun → Gaborone'),
('Francistown → Gaborone');

-- Route stops
INSERT INTO route_stops (route_id, stop_order, stop_name) VALUES
(1, 1, 'Gaborone'),
(1, 2, 'Palapye'),
(1, 3, 'Maun'),

(2, 1, 'Maun'),
(2, 2, 'Palapye'),
(2, 3, 'Gaborone'),

(3, 1, 'Francistown'),
(3, 2, 'Gaborone');

-- Trips
INSERT INTO trips (route_id, departure_time, capacity) VALUES
(1, '04:30', 62),
(1, '18:00', 72),
(2, '09:30', 62),
(2, '18:00', 72),
(3, '05:30', 62);

