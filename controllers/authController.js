// controllers/authController.js
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

  if (!admin || admin.password !== password) {
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
  const { username, email } = req.body;

  // Log the received email for debugging
  console.log(
    `Received reset request for username: ${username}, email: ${email}`
  );

  if (!username || !email) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide both username and email",
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

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to database with expiration (10 minutes)
  await AdminModel.saveResetOTP(admin.id, otp);

  // Email content
  const message = `Your password reset OTP is: ${otp}. It will expire in 10 minutes.`;
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>You requested to reset your password. Please use the following OTP code:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  try {
    // Log the recipient email right before sending
    console.log(`Sending email to: ${email}`);

    const emailResult = await sendEmail({
      email: email, // Use the email from request body
      subject: "Your Password Reset OTP",
      message,
      html: htmlMessage,
    });

    console.log("Email sent successfully");

    res.status(200).json({
      status: "success",
      message: "OTP sent to email!",
      // Include this for debugging
      sentTo: email,
    });
  } catch (err) {
    logger.error("Error sending password reset email:", err);
    console.error("Email sending error:", err);
    await AdminModel.clearResetData(admin.id);

    return res.status(500).json({
      status: "error",
      message: "There was an error sending the email. Try again later!",
    });
  }
});
// Verify OTP
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { username, otp } = req.body;

  if (!username || !otp) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide username and OTP",
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

  // Verify OTP
  const isValidOTP = await AdminModel.verifyOTP(admin.id, otp);

  if (!isValidOTP) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid or expired OTP",
    });
  }

  // Generate reset token for password reset
  const resetToken = await AdminModel.createPasswordResetToken(admin.id);

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
    resetToken,
  });
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide reset token and new password",
    });
  }

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

  // Clear reset data
  await AdminModel.clearResetData(admin.id);

  // Generate new JWT token
  const jwtToken = generateToken(admin.id);

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    token: jwtToken,
  });
});
