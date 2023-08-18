const express = require("express");
const medicalFieldController = require("../controller/medicalFieldController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, medicalFieldController.createMedicalField);
router.patch("/update", protect, medicalFieldController.updateMedicalField);
router.get("/all", protect, medicalFieldController.getAllMedicalField);
router.delete(
  "/:medicalFieldId",
  protect,
  medicalFieldController.deleteMedicalField
);

module.exports = router;
