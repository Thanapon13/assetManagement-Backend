const express = require("express");
const personnelTypeCodeController = require("../controller/personnelTypeCodeController");

const router = express.Router();
router.post("/create", personnelTypeCodeController.createPersonnelTypeCode);
router.patch("/update", personnelTypeCodeController.updatePersonnelTypeCode);
router.get("/all", personnelTypeCodeController.getAllPersonnelTypeCode);
router.delete("/:personnelTypeCodeId", personnelTypeCodeController.deletePersonnelTypeCode);

module.exports = router;
