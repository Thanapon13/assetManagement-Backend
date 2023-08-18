const jwt = require("jsonwebtoken");

const generateAccessToken = (userData) => {
  console.log("userData : ", userData);

  return jwt.sign({ userData }, process.env.ACCESS_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN,
  });
};

const generateRefreshToken = (userData) => {
  return jwt.sign({ userData }, process.env.REFRESH_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
