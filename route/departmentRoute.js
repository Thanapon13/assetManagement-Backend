const express = require("express");
const departmentController = require("../controller/departmentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, departmentController.createDepartment);
router.patch("/update", protect, departmentController.updateDepartment);
router.get("/all", protect, departmentController.getAllDepartment);
router.delete("/:departmentId", protect, departmentController.deleteDepartment);

module.exports = router;
