const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models").user;

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization
    //  &&
    // req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header. [1] want only token

      token = req.headers.authorization.split(" ")[1]; // get token from bearer token space to this to array ([bearer token]) spllit by space
      // token = req.headers.authorization;
      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      const decodedObjected = JSON.stringify(decoded.userData);

      const decodedObjected2 = JSON.parse(decodedObjected);
      req.user = await User.findByPk(decodedObjected2._id, {
        exclude: ["password"],
      });
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, No token");
  }
});

module.exports = protect;
