const router   = require("express").Router();
const { body } = require("express-validator");
const pool     = require("../db/pool");
const { authenticate, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const logger   = require("../logger");

// All admin routes require a valid JWT AND admin role
router.use(authenticate, requireAdmin);

// ─── POST /api/admin/scan ─────────────────────────────────────────────────────

router.post(
  "/scan",
  [body("bookingRef").trim().notEmpty().withMessage("Booking reference required.")],
  validate,
  async (req, res, next) => {
    try {
      const { bookingRef } = req.body;

      const result = await pool.query(
        `SELECT b.id, b.booking_ref, b.status, b.payment_status,
                b.seats, b.pickup, b.dropoff,
                u.name AS passenger_name,
                r.name AS route_name,
                t.departure_time
         FROM bookings b
         JOIN users  u ON u.id = b.user_id
         JOIN trips  t ON t.id = b.trip_id
         JOIN routes r ON r.id = t.route_id
         WHERE b.booking_ref = $1`,
        [bookingRef]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const booking = result.rows[0];

      if (booking.status === "CANCELLED") {
        return res.status(409).json({ message: "This booking has been cancelled." });
      }
      if (booking.status === "SCANNED") {
        return res.status(409).json({ message: "Ticket already scanned." });
      }
      if (booking.payment_status !== "paid") {
        return res.status(402).json({ message: "Payment not completed for this booking." });
      }

      // Mark as scanned
      await pool.query(
        "UPDATE bookings SET status = 'SCANNED' WHERE booking_ref = $1",
        [bookingRef]
      );

      logger.info("Ticket scanned", { bookingRef, adminId: req.user.id });
      res.json({ ...booking, status: "SCANNED" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/bookings ──────────────────────────────────────────────────

router.get("/bookings", async (req, res, next) => {
  try {
    const { status, date, routeId } = req.query;
    let query = `
      SELECT b.id, b.booking_ref, b.status, b.payment_status,
             b.pickup, b.dropoff, b.travel_date, b.seats,
             u.name AS passenger_name, u.email AS passenger_email,
             r.name AS route_name, t.departure_time
      FROM bookings b
      JOIN users  u ON u.id = b.user_id
      JOIN trips  t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status.toUpperCase());
      query += ` AND b.status = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND b.travel_date = $${params.length}`;
    }
    if (routeId) {
      params.push(parseInt(routeId));
      query += ` AND t.route_id = $${params.length}`;
    }

    query += " ORDER BY b.created_at DESC LIMIT 200";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;