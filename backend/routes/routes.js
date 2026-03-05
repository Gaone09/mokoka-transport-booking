const router = require("express").Router();
const pool   = require("../db/pool");

// GET /api/routes — public, list all routes with their stops
router.get("/", async (req, res, next) => {
  try {
    const routes = await pool.query("SELECT id, name FROM routes ORDER BY id");

    // Attach stops to each route
    const stops = await pool.query(
      "SELECT route_id, stop_order, stop_name FROM route_stops ORDER BY route_id, stop_order"
    );

    const stopMap = {};
    for (const s of stops.rows) {
      if (!stopMap[s.route_id]) stopMap[s.route_id] = [];
      stopMap[s.route_id].push({ order: s.stop_order, name: s.stop_name });
    }

    const data = routes.rows.map((r) => ({
      ...r,
      stops: stopMap[r.id] || [],
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;