const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

// router
//   .route('/')
//   .get(userController.getAllUsers)
//   .post(userController.createNewUser)


router.get("/all", userController.getAllUsers);
router.get("/verifyEmail", userController.verifyEmail);
router.get("/sectorForSearch", userController.getSectorForSearch);
router.get("/userRepairDropdown", userController.getUserRepairDropdown);
router.get("/search", userController.getBySearch);
router.post("/create", userController.createUser);
router.post("/update/:userId", userController.updateUser);
// router.patch("/delete/:userId", userController.deleteUser);
router.get("/:userId", protect, userController.getUserById);
router.post("/login", userController.login);
router.post("/resetPassword/:userId", userController.resetPassword);
module.exports = router;
