// middleware/errorHandler.js
const logger = require("../config/winston");

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Handle specific errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Your token has expired. Please log in again.",
    });
  }

  // Database errors
  if (err.code === "23505") {
    // Unique violation in PostgreSQL
    return res.status(409).json({
      status: "fail",
      message: "Duplicate entry. Resource already exists.",
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
