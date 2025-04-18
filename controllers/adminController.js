// controllers/adminController.js
const asyncHandler = require("../utils/asyncHandler");
const AdminModel = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const logger = require("../config/winston");

// Get current admin profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      id: req.admin.id,
      username: req.admin.username,
      client_id: req.admin.client_id,
    },
  });
});

// Update admin password
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Check if passwords are provided
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide current and new password",
    });
  }

  // Check if current password is correct
  const passwordCorrect = await bcrypt.compare(
    currentPassword,
    req.admin.password
  );

  if (!passwordCorrect) {
    return res.status(401).json({
      status: "fail",
      message: "Current password is incorrect",
    });
  }

  // Update password
  await AdminModel.updatePassword(req.admin.id, newPassword);

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});
