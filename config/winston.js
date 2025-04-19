// config/winston.js
const winston = require("winston");
const path = require("path");

// Define custom format for console with error stacks
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    // Include the stack trace in console output if available
    const stack = info.stack ? `\n${info.stack}` : "";
    return `${info.timestamp} ${info.level}: ${info.message}${stack}`;
  })
);

// Define log format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define which transports to use
const transports = [
  // Console transport with enhanced error display
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
  }),
  // File transport for errors
  new winston.transports.File({
    filename: path.join("logs", "error.log"),
    level: "error",
    format: fileFormat,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: path.join("logs", "combined.log"),
    format: fileFormat,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
  exitOnError: false,
});

module.exports = logger;
