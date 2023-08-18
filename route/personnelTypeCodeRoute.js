const express = require("express");
const personnelTypeCodeController = require("../controller/personnelTypeCodeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post(
  "/create",
  protect,
  personnelTypeCodeController.createPersonnelTypeCode
);
router.patch(
  "/update",
  protect,
  personnelTypeCodeController.updatePersonnelTypeCode
);
router.get(
  "/all",
  protect,
  personnelTypeCodeController.getAllPersonnelTypeCode
);
router.delete(
  "/:personnelTypeCodeId",
  protect,
  personnelTypeCodeController.deletePersonnelTypeCode
);

module.exports = router;
