const router = require("express").Router();
const pool   = require("../db/pool");

// GET /api/trips/route/:routeId — trips for a specific route
router.get("/route/:routeId", async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.routeId);
    if (isNaN(routeId)) return res.status(400).json({ message: "Invalid route ID." });

    const result = await pool.query(
      `SELECT t.id, t.departure_time, t.capacity, t.status,
              r.name AS route_name,
              (t.capacity - COALESCE(SUM(b.seats), 0)) AS seats_available
       FROM trips t
       JOIN routes r ON r.id = t.route_id
       LEFT JOIN bookings b ON b.trip_id = t.id AND b.status != 'CANCELLED'
       WHERE t.route_id = $1 AND t.status = 'scheduled'
       GROUP BY t.id, r.name
       ORDER BY t.departure_time`,
      [routeId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;