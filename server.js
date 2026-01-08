const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const routesPath = path.join(__dirname, "data/routes.json");
const bookingsPath = path.join(__dirname, "data/bookings.json");
//Utility function
const readJSON = (file) => {
  if (!fs.existsSync(file)) return [];
  const data = fs.readFileSync(file, "utf8");
  return data ? JSON.parse(data) : [];
};

//get all routes
app.get("/api/routes", (req, res) => {
  const routes = readJSON(routesPath);
  res.json(routes);
});

//POST booking
app.post("/api/book", (req, res) => {
  const {
    routeId,
    tripTime,
    seats,
    pickup,
    dropoff,
    date,
    returnDate,
    tripType,
  } = req.body;

  if (!routeId || !tripTime || !seats || !pickup || !dropoff || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const routes = readJSON(routesPath);
  const route = routes.find((r) => r.id === routeId);

  if (!route) {
    return res.status(404).json({ message: "Route not found" });
  }

  const trip = route.trips.find((t) => t.time === tripTime);

  if (!trip || trip.capacity < seats) {
    return res.status(400).json({ message: "Not enough seats available" });
  }

  // Reduce seats
  trip.capacity -= seats;
  writeJSON(routesPath, routes);

  //Save booking
  const bookings = readJSON(bookingsPath);

  const bookingRef = `MK-${routeId}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;

  const booking = {
    bookingRef,
    routeId,
    tripTime,
    seats,
    pickup,
    dropoff,
    date,
    returnDate: tripType === "round-trip" ? returnDate : null,
    tripType,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  writeJSON(bookingsPath, bookings);

  res.json({
    message: "Booking confirmed",
    booking,
  });
});
app.get("/api/bookings/:ref", (req, res) => {
  const bookings = readJSON(bookingsPath);
  const booking = bookings.find((b) => b.bookingRef === req.params.ref);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.json(booking);
});

//Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
