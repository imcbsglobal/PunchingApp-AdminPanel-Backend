// utils/helpers.js
const crypto = require("crypto");

exports.generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
