const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET trips by route
router.get("/route/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;
    const { date } = req.query;
    let query = `
      SELECT t.id, t.departure_time, t.capacity
      FROM trips t
      WHERE t.route_id = $1
      ORDER BY t.departure_time
    `;
    let params = [routeId];
    if (date) {
      query = `
        SELECT t.id, t.departure_time, t.capacity,
               COALESCE(SUM(b.seats), 0) as booked,
               t.capacity - COALESCE(SUM(b.seats), 0) as available
        FROM trips t
        LEFT JOIN bookings b ON b.trip_id = t.id AND b.travel_date = $2
        WHERE t.route_id = $1
        GROUP BY t.id, t.departure_time, t.capacity
        ORDER BY t.departure_time
      `;
      params = [routeId, date];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Failed to load trips:", err.message);
    res.status(500).json({ message: "Failed to load trips" });
  }
});

module.exports = router;
