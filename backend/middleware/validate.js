const { validationResult } = require("express-validator");

/**
 * Drop this after your express-validator chains.
 * Returns 422 with field-level errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed.",
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
};

module.exports = validate;