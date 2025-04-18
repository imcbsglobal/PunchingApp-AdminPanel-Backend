// models/adminModel.js
const { query } = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateRandomToken, hashToken } = require("../utils/helpers");

exports.createAdmin = async (username, password, clientId) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const { rows } = await query(
    "INSERT INTO admins (username, password, client_id) VALUES ($1, $2, $3) RETURNING *",
    [username, hashedPassword, clientId]
  );

  return rows[0];
};

exports.findAdminByUsername = async (username) => {
  const { rows } = await query("SELECT * FROM admins WHERE username = $1", [
    username,
  ]);

  return rows[0];
};

exports.updatePassword = async (adminId, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const { rows } = await query(
    "UPDATE admins SET password = $1 WHERE id = $2 RETURNING *",
    [hashedPassword, adminId]
  );

  return rows[0];
};

exports.createPasswordResetToken = async (adminId) => {
  const resetToken = generateRandomToken();
  const passwordResetToken = hashToken(resetToken);
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await query(
    "UPDATE admins SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
    [passwordResetToken, passwordResetExpires, adminId]
  );

  return resetToken;
};

exports.findAdminByResetToken = async (token) => {
  const hashedToken = hashToken(token);

  const { rows } = await query(
    "SELECT * FROM admins WHERE password_reset_token = $1 AND password_reset_expires > NOW()",
    [hashedToken]
  );

  return rows[0];
};

exports.clearResetToken = async (adminId) => {
  await query(
    "UPDATE admins SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1",
    [adminId]
  );
};
