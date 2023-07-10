const express = require("express");
const router = express.Router();
const adminAuthController = require("../controller/adminAuthController");
// const customerAuthController = require("../controllers/customer/customerAuthController");

// router.post("/users/login", userAuthController.login);
// router.post(
//   "/customers/signup",
//   upload.fields([{ name: "profilePic", maxCount: 1 }]),
//   customerAuthController.signup
// );

router.post("/admins/login", adminAuthController.login);
// router.post(
//   "/admins/signup",
//   upload.fields([{ name: "profilePic", maxCount: 1 }]),
//   adminAuthController.signup
// );


module.exports = router;
