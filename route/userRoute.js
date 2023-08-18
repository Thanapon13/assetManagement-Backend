const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

router.get("/all", protect, userController.getAllUsers);
router.get("/verifyEmail", userController.verifyEmail);
router.get("/sectorForSearch", protect, userController.getSectorForSearch);
router.get(
  "/userRepairDropdown",
  protect,
  userController.getUserRepairDropdown
);
router.get("/search", protect, userController.getBySearch);
router.post("/create", userController.createUser);

router.post("/update/:userId", protect, userController.updateUser);
router.get("/:userId", protect, userController.getUserById);
router.post("/login", userController.login);
router.post("/refreshToken", userController.RefreshToken);
router.post("/logout", protect, userController.logout);
router.post("/resetPassword/:userId", userController.resetPassword);
router.patch("/delete/:userId", protect, userController.deleteUser);
module.exports = router;
