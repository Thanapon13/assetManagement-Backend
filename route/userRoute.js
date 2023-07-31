const express = require("express");
const router = express.Router();
// const protect = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

router.get("/all", userController.getAllUsers);
router.get("/verifyEmail", userController.verifyEmail);
router.get("/sectorForSearch", userController.getSectorForSearch);
router.get("/userRepairDropdown", userController.getUserRepairDropdown);
router.get("/search", userController.getBySearch);
router.post("/create", userController.createUser);
router.post("/update/:userId", userController.updateUser);
router.get("/:userId", userController.getUserById);
router.post("/login", userController.login);
router.post("/resetPassword/:userId", userController.resetPassword);
router.patch("/delete/:userId", userController.deleteUser);
module.exports = router;
