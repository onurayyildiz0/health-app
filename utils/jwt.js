const jwt = require("jsonwebtoken");

// Access token üretimi
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

// Refresh token üretimi
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
