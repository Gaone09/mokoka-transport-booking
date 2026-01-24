const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST booking
router.post("/", async (req, res) => {
  try {
    const { tripId, pickup, dropoff, date, returnDate, tripType, seats } =
      req.body;

    if (!tripId || !pickup || !dropoff || !date || !seats) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check trip exists and capacity
    const tripRes = await pool.query("SELECT * FROM trips WHERE id = $1", [
      tripId,
    ]);
    const trip = tripRes.rows[0];

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.capacity < seats)
      return res.status(400).json({ message: "Not enough seats available" });

    // Reduce seats
    await pool.query(
      "UPDATE trips SET capacity = capacity - $1 WHERE id = $2",
      [seats, tripId]
    );

    // Generate booking reference
    const bookingRef = `MK-${tripId}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Insert booking
    const insertRes = await pool.query(
      `INSERT INTO bookings (trip_id, pickup, dropoff, travel_date, seats, booking_ref)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [tripId, pickup, dropoff, date, seats, bookingRef]
    );

    res.json({ message: "Booking confirmed", booking: insertRes.rows[0] });
  } catch (err) {
    console.error("Booking failed:", err.message);
    res.status(500).json({ message: "Booking failed" });
  }
});

// GET bookings by ref
router.get("/:ref", async (req, res) => {
  try {
    const { ref } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM bookings WHERE booking_ref = $1",
      [ref]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Booking not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Failed to fetch booking:", err.message);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

module.exports = router;
