const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all routes with stops
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.name,
        COALESCE(
          json_agg(rs.stop_name ORDER BY rs.stop_order)
          FILTER (WHERE rs.id IS NOT NULL),
          '[]'
        ) AS stops
      FROM routes r
      LEFT JOIN route_stops rs ON rs.route_id = r.id
      GROUP BY r.id
      ORDER BY r.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error loading routes:", err);
    res.status(500).json({ message: "Failed to load routes" });
  }
});

// GET single route with stops
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        r.id,
        r.name,
        COALESCE(
          json_agg(rs.stop_name ORDER BY rs.stop_order)
          FILTER (WHERE rs.id IS NOT NULL),
          '[]'
        ) AS stops
      FROM routes r
      LEFT JOIN route_stops rs ON rs.route_id = r.id
      WHERE r.id = $1
      GROUP BY r.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error loading route:", err);
    res.status(500).json({ message: "Failed to load route" });
  }
});

module.exports = router;
