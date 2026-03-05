
const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Always write errors to file
    new transports.File({ filename: "logs/error.log", level: "error" }),
    // All levels in combined log
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// In development also print to console in readable format
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

module.exports = logger;