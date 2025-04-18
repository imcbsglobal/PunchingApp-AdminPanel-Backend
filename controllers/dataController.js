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

  const { rows } = await query(
    "SELECT * FROM punch_records WHERE client_id = $1",
    [clientId]
  );

  res.status(200).json({
    status: "success",
    results: rows.length,
    data: rows,
  });
});
