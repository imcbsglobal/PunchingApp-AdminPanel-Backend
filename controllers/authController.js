// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AdminModel = require("../models/adminModel");
const sendEmail = require("../services/emailService");
const { generateToken } = require("../services/tokenService");
const logger = require("../config/winston");

// Admin login
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide username and password",
    });
  }

  // Check if admin exists
  const admin = await AdminModel.findAdminByUsername(username);

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({
      status: "fail",
      message: "Incorrect username or password",
    });
  }

  // Generate token
  const token = generateToken(admin.id);

  // Send response
  res.status(200).json({
    status: "success",
    token,
    data: {
      id: admin.id,
      username: admin.username,
      client_id: admin.client_id,
    },
  });
});

// Forgot password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide your username",
    });
  }

  // Find admin by username
  const admin = await AdminModel.findAdminByUsername(username);

  if (!admin) {
    return res.status(404).json({
      status: "fail",
      message: "No admin found with that username",
    });
  }

  // Generate reset token
  const resetToken = await AdminModel.createPasswordResetToken(admin.id);

  // Create reset URL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: admin.email || "admin@example.com", // Fallback if no email in db
      subject: "Your password reset token (valid for 10 min)",
      message,
      html: `<p>Forgot your password?</p>
            <p>Click <a href="${resetURL}">here</a> to reset your password or submit a PATCH request with your new password to: ${resetURL}.</p>
            <p>If you didn't forget your password, please ignore this email.</p>`,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    logger.error("Error sending password reset email:", err);
    await AdminModel.clearResetToken(admin.id);

    return res.status(500).json({
      status: "error",
      message: "There was an error sending the email. Try again later!",
    });
  }
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find admin by reset token
  const admin = await AdminModel.findAdminByResetToken(token);

  if (!admin) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or has expired",
    });
  }

  // Update password
  await AdminModel.updatePassword(admin.id, password);

  // Clear reset token
  await AdminModel.clearResetToken(admin.id);

  // Generate new JWT token
  const jwtToken = generateToken(admin.id);

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    token: jwtToken,
  });
});
