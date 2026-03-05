const logger = require("../logger");

/**
 * Global Express error handler.
 * - Logs full detail server-side (stack, path, method, userId).
 * - Returns only a generic message to the client.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled server error", {
    message: err.message,
    stack:   err.stack,
    path:    req.path,
    method:  req.method,
    userId:  req.user?.id ?? null,
  });

  // Don't expose internal details
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: "Something went wrong. Please try again." });
};

module.exports = errorHandler;