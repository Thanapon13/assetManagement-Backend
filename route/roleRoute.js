const express = require("express");
const router = express.Router();
// const protect = require("../middleware/authMiddleware");
const roleController = require("../controller/roleController");

router.get("/all", roleController.getAllRole);
router.get("/search", roleController.getBySearch);
router.get("/:roleId", roleController.getRoleById);
router.post("/create", roleController.createRole);
router.patch("/update/:roleId", roleController.updateRole);
router.delete("/delete/:roleId", roleController.deleteRole);
module.exports = router;
