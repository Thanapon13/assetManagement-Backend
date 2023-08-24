const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const roleController = require("../controller/roleController");

router.get("/all", protect, roleController.getAllRole);
router.get("/search", protect, roleController.getBySearch);
router.get("/:roleId", roleController.getRoleById);
router.post("/create", roleController.createRole);
router.patch("/update/:roleId", protect, roleController.updateRole);
router.delete("/delete/:roleId", protect, roleController.deleteRole);
module.exports = router;
