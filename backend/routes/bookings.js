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

    // Check trip exists and available seats
    const tripRes = await pool.query(`
      SELECT t.capacity, COALESCE(SUM(b.seats), 0) as booked
      FROM trips t
      LEFT JOIN bookings b ON b.trip_id = t.id AND b.travel_date = $2
      WHERE t.id = $1
      GROUP BY t.id, t.capacity
    `, [tripId, date]);
    
    if (tripRes.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = tripRes.rows[0];
    const availableSeats = trip.capacity - trip.booked;

    if (availableSeats < seats) {
      return res.status(400).json({ 
        message: `Not enough seats available. Only ${availableSeats} seats left.` 
      });
    }

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
router.post("/:id/pay", auth, async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE bookings SET payment_status = 'paid' WHERE id = $1",
    [id]
  );

  res.json({ message: "Payment successful" });
});


module.exports = router;
