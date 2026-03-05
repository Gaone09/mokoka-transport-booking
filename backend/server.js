require("dotenv").config({ path: __dirname + "/.env" });

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const helmet       = require("helmet");
const rateLimit    = require("express-rate-limit");

const logger       = require("./logger");
const pool         = require("./db/pool");
const errorHandler = require("./middleware/errorHandler");

const authRouter    = require("./routes/auth");
const routesRouter  = require("./routes/routes");
const tripsRouter   = require("./routes/trips");
const bookingsRouter= require("./routes/bookings");
const adminRouter   = require("./routes/admin");
const webhookRouter = require("./routes/webhook");

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    logger.warn("CORS blocked request", { origin });
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─── Rate limiting on auth routes only ───────────────────────────────────────
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again later." },
}));

// ─── Stripe webhook MUST come before express.json() ──────────────────────────
app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  webhookRouter
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRouter);
app.use("/api/routes",   routesRouter);
app.use("/api/trips",    tripsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin",    adminRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch {
    res.status(503).json({ status: "ERROR", db: "disconnected" });
  }
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5000");

app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`, {
    env:     process.env.NODE_ENV || "development",
    origins: ALLOWED_ORIGINS,
  });
});

module.exports = app;