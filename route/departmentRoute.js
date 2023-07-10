const express = require("express");
const departmentController = require("../controller/departmentController");

const router = express.Router();
router.post("/create", departmentController.createDepartment);
router.patch("/update", departmentController.updateDepartment);
router.get("/all", departmentController.getAllDepartment);
router.delete("/:departmentId", departmentController.deleteDepartment);

module.exports = router;
