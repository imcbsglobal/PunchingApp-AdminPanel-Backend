// controllers/dataController.js
const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/winston");

// Get user data
exports.getUsers = asyncHandler(async (req, res) => {
  const clientId = req.admin.client_id;

  const { rows } = await query("SELECT * FROM acc_users WHERE client_id = $1", [
    clientId,
  ]);

  res.status(200).json({
    status: "success",
    results: rows.length,
    data: rows,
  });
});

// Get master data
exports.getMasterData = asyncHandler(async (req, res) => {
  const clientId = req.admin.client_id;

  const { rows } = await query(
    "SELECT * FROM acc_master WHERE client_id = $1",
    [clientId]
  );

  res.status(200).json({
    status: "success",
    results: rows.length,
    data: rows,
  });
});

// Get punch records
exports.getPunchRecords = asyncHandler(async (req, res) => {
  const clientId = req.admin.client_id;

  // only last 10 days
  const { rows } = await query(
    `SELECT *
     FROM punch_records
     WHERE client_id = $1
       AND punch_date >= current_date - INTERVAL '10 days'
     ORDER BY punch_date DESC, punch_in_time DESC`,
    [clientId]
  );

  res.status(200).json({
    status: "success",
    results: rows.length,
    data: rows,
  });
});

// Get punch records for a specific date
exports.getPunchRecordsByDate = asyncHandler(async (req, res) => {
  const clientId = req.admin.client_id;
  const dateParam = req.query.date;

  // validate presence
  if (!dateParam) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a date in YYYY-MM-DD format via ?date=",
    });
  }

  // (Optional) Validate format with a simple regex
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return res.status(400).json({
      status: "fail",
      message: "Date must be in YYYY-MM-DD format.",
    });
  }

  const { rows } = await query(
    `SELECT *
     FROM punch_records
     WHERE client_id = $1
       AND punch_date = $2::date
     ORDER BY punch_in_time`,
    [clientId, dateParam]
  );

  res.status(200).json({
    status: "success",
    results: rows.length,
    data: rows,
  });
});
