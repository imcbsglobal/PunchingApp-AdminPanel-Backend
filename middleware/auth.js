// middleware/auth.js
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const logger = require("../config/winston");
const asyncHandler = require("../utils/asyncHandler");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in. Please log in to get access.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin exists
    const { rows } = await query("SELECT * FROM admins WHERE id = $1", [
      decoded.id,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Set the admin data to req.admin
    req.admin = rows[0];
    next();
  } catch (error) {
    logger.error("JWT verification error:", error);
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or token expired. Please log in again.",
    });
  }
});
