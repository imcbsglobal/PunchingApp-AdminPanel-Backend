const { query } = require("../config/db");
const { generateRandomToken, hashToken } = require("../utils/helpers");

// Login by username
exports.findAdminByUsername = async (username) => {
  const { rows } = await query("SELECT * FROM sync_users WHERE username = $1", [
    username,
  ]);
  return rows[0];
};

// Update password directly (no hashing)
exports.updatePassword = async (adminId, newPassword) => {
  const { rows } = await query(
    "UPDATE sync_users SET password = $1 WHERE id = $2 RETURNING *",
    [newPassword, adminId]
  );
  return rows[0];
};

// Generate reset token and save to sync_users table
exports.createPasswordResetToken = async (adminId) => {
  const resetToken = generateRandomToken();
  const passwordResetToken = hashToken(resetToken);
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await query(
    "UPDATE sync_users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
    [passwordResetToken, passwordResetExpires, adminId]
  );

  return resetToken;
};

// Find admin by reset token
exports.findAdminByResetToken = async (token) => {
  const hashedToken = hashToken(token);
  const { rows } = await query(
    "SELECT * FROM sync_users WHERE password_reset_token = $1 AND password_reset_expires > NOW()",
    [hashedToken]
  );
  return rows[0];
};

// Clear reset token
exports.clearResetToken = async (adminId) => {
  await query(
    "UPDATE sync_users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1",
    [adminId]
  );
};

// Save OTP to database with expiration
exports.saveResetOTP = async (adminId, otp) => {
  // Store OTP with 10-minute expiration
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const { rows } = await query(
    "UPDATE sync_users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3 RETURNING *",
    [otp, otpExpires, adminId]
  );

  return rows[0];
};

// Verify OTP validity and expiration
exports.verifyOTP = async (adminId, otp) => {
  const { rows } = await query(
    "SELECT * FROM sync_users WHERE id = $1 AND reset_otp = $2 AND reset_otp_expires > NOW()",
    [adminId, otp]
  );

  return rows.length > 0;
};

// Clear all reset-related data
exports.clearResetData = async (adminId) => {
  await query(
    "UPDATE sync_users SET reset_otp = NULL, reset_otp_expires = NULL, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1",
    [adminId]
  );
};
