const router = require("express").Router();
const pool   = require("../db/pool");
const logger = require("../logger");

/**
 * IMPORTANT: This route must receive the RAW request body (Buffer), NOT parsed JSON.
 * Mount it in server.js BEFORE express.json() using express.raw().
 */
router.post(
  "/",
  // express.raw is applied per-route in server.js, not here
  async (req, res, next) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const sig    = req.headers["stripe-signature"];

    let event;
    try {
      // Verify signature using the raw body buffer
      event = stripe.webhooks.constructEvent(
        req.body,                           // must be raw Buffer
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.warn("Stripe webhook signature verification failed", { err: err.message });
      return res.status(400).json({ message: "Webhook signature verification failed." });
    }

    try {
      if (event.type === "payment_intent.succeeded") {
        const intent    = event.data.object;
        const bookingId = intent.metadata?.bookingId;

        if (bookingId) {
          await pool.query(
            `UPDATE bookings SET payment_status = 'paid' WHERE id = $1`,
            [parseInt(bookingId)]
          );
          await pool.query(
            `INSERT INTO payments (booking_id, provider, amount, status)
             VALUES ($1, 'stripe', $2, 'succeeded')`,
            [parseInt(bookingId), intent.amount / 100]
          );
          logger.info("Payment confirmed via webhook", { bookingId, intentId: intent.id });
        }
      }

      if (event.type === "payment_intent.payment_failed") {
        const intent    = event.data.object;
        const bookingId = intent.metadata?.bookingId;
        if (bookingId) {
          logger.warn("Payment failed via webhook", { bookingId, intentId: intent.id });
          await pool.query(
            `INSERT INTO payments (booking_id, provider, amount, status)
             VALUES ($1, 'stripe', $2, 'failed')`,
            [parseInt(bookingId), intent.amount / 100]
          );
        }
      }

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;