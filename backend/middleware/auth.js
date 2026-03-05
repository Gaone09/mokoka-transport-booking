const jwt  = require("jsonwebtoken");
const logger = require("../logger");

/**
 * Verifies the short-lived access token sent in the Authorization header.
 * Attaches req.user = { id, email, role, ... } on success.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    // Log the real reason server-side; send generic message to client
    logger.warn("Access token verification failed", { err: err.message, ip: req.ip });
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
};

/**
 * Must be used AFTER authenticate.
 * Returns 403 Forbidden unless req.user.role === "admin".
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    logger.warn("Admin route access denied", { userId: req.user?.id, ip: req.ip });
    return res.status(403).json({ message: "Access denied." });
  }
  next();
};

module.exports = { authenticate, requireAdmin };