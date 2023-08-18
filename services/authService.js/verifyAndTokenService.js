const jwt = require("jsonwebtoken");

const generateAccessToken = (userData, accessScreenData) => {
  return jwt.sign({ userData }, process.env.ACCESS_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN,
  });
};

const generateRefreshToken = (userData, accessScreenData) => {
  return jwt.sign({ userData }, process.env.REFRESH_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN,
  });
};

// async function verify() {
//   return;
// }
const verify = async (refreshtoken) => {
  return jwt.verify(refreshtoken, process.env.REFRESH_TOKEN);
};

module.exports = { generateAccessToken, generateRefreshToken, verify };
