const express = require("express");
const router = express.Router();
// const protect = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

router.get("/all", userController.getAllUsers);
router.get("/verifyEmail", userController.verifyEmail);
router.get("/sectorForSearch", userController.getSectorForSearch);
router.get("/userRepairDropdown", userController.getUserRepairDropdown);
router.get("/search", userController.getBySearch);
router.post("/create", userController.createUser); // แก้ roleId ไม่ต้องไป create TB role
router.post("/update/:userId", userController.updateUser); // แก้ roleId ไม่ต้องไป create TB role
router.get("/:userId", userController.getUserById);
router.post("/login", userController.login);
router.post("/resetPassword/:userId", userController.resetPassword);
router.patch("/delete/:userId", userController.deleteUser);
module.exports = router;
