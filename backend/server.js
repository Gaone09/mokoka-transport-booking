const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routesRouter = require("./routes/routes");
const tripsRouter = require("./routes/trips");
const bookingsRouter = require("./routes/bookings");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/routes", routesRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/bookings", bookingsRouter);

app.get("/health", (_, res) => res.json({ status: "OK" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
