const express = require("express");
const medicalFieldController = require("../controller/medicalFieldController");

const router = express.Router();
router.post("/create", medicalFieldController.createMedicalField);
router.patch("/update", medicalFieldController.updateMedicalField);
router.get("/all", medicalFieldController.getAllMedicalField);
router.delete("/:medicalFieldId", medicalFieldController.deleteMedicalField);

module.exports = router;
