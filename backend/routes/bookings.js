const router   = require("express").Router();
const { body } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const pool     = require("../db/pool");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const logger   = require("../logger");

// ─── Validation ───────────────────────────────────────────────────────────────

const bookingRules = [
  body("tripId").isInt({ min: 1 }).withMessage("Valid trip required."),
  body("pickup").trim().notEmpty().withMessage("Pickup location required.").isLength({ max: 200 }),
  body("dropoff").trim().notEmpty().withMessage("Drop-off location required.").isLength({ max: 200 }),
  body("date").isDate().withMessage("Valid travel date required."),
  body("seats").isInt({ min: 1, max: 20 }).withMessage("Seats must be between 1 and 20."),
];

// ─── GET /api/bookings/my ─────────────────────────────────────────────────────

router.get("/my", authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.booking_ref, b.pickup, b.dropoff, b.travel_date AS date,
              b.seats, b.status, b.payment_status,
              r.name AS route_name,
              t.departure_time
       FROM bookings b
       JOIN trips t  ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/bookings/:ref ───────────────────────────────────────────────────

router.get("/:ref", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.booking_ref, b.pickup, b.dropoff, b.travel_date AS date,
              b.seats, b.status, b.payment_status,
              r.name AS route_name,
              t.departure_time
       FROM bookings b
       JOIN trips t  ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
       WHERE b.booking_ref = $1`,
      [req.params.ref]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/bookings ───────────────────────────────────────────────────────

router.post("/", authenticate, bookingRules, validate, async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { tripId, pickup, dropoff, date, seats } = req.body;

    // Step 1: Lock the trip row first (FOR UPDATE without GROUP BY)
    const lockResult = await client.query(
      `SELECT id, capacity FROM trips
       WHERE id = $1 AND status = 'scheduled'
       FOR UPDATE`,
      [tripId]
    );

    if (!lockResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Trip not found or no longer available." });
    }

    const trip = lockResult.rows[0];

    // Step 2: Calculate seats taken separately
    const seatsResult = await client.query(
      `SELECT COALESCE(SUM(seats), 0) AS seats_taken
       FROM bookings
       WHERE trip_id = $1 AND status != 'CANCELLED'`,
      [tripId]
    );

    const seatsTaken     = parseInt(seatsResult.rows[0].seats_taken);
    const seatsAvailable = trip.capacity - seatsTaken;

    if (seatsAvailable < seats) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Only ${seatsAvailable} seat(s) available on this trip.`,
      });
    }

    const bookingRef = `JC-${uuidv4().substring(0, 8).toUpperCase()}`;

    const booking = await client.query(
      `INSERT INTO bookings
         (trip_id, user_id, pickup, dropoff, travel_date, seats, booking_ref, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED', 'pending')
       RETURNING id, booking_ref, status, payment_status`,
      [tripId, req.user.id, pickup, dropoff, date, seats, bookingRef]
    );

    await client.query("COMMIT");

    logger.info("Booking created", { bookingRef, userId: req.user.id });
    res.status(201).json({ booking: booking.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// ─── POST /api/bookings/cancel ────────────────────────────────────────────────

router.post("/cancel", authenticate, async (req, res, next) => {
  try {
    const { bookingRef } = req.body;
    if (!bookingRef) return res.status(400).json({ message: "Booking reference required." });

    // Users can only cancel their own bookings
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'CANCELLED'
       WHERE booking_ref = $1
         AND user_id = $2
         AND status = 'CONFIRMED'
       RETURNING id, booking_ref, status`,
      [bookingRef, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Booking not found or cannot be cancelled." });
    }

    logger.info("Booking cancelled", { bookingRef, userId: req.user.id });
    res.json({ booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/bookings/:id/pay ───────────────────────────────────────────────
// Creates a Stripe payment intent. Actual confirmation happens via webhook.

router.post("/:id/pay", authenticate, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) return res.status(400).json({ message: "Invalid booking ID." });

    // Verify ownership
    const result = await pool.query(
      "SELECT id, seats, payment_status FROM bookings WHERE id = $1 AND user_id = $2",
      [bookingId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = result.rows[0];
    if (booking.payment_status === "paid") {
      return res.status(409).json({ message: "Booking is already paid." });
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const PRICE_PER_SEAT_CENTS = 5000; // R50 per seat — adjust as needed

    const intent = await stripe.paymentIntents.create({
      amount:   booking.seats * PRICE_PER_SEAT_CENTS,
      currency: "zar",
      metadata: { bookingId: String(bookingId), userId: String(req.user.id) },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
});

module.exports = router;