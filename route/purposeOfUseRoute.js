const express = require("express");
const purposeOfUseController = require("../controller/purposeOfUseController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, purposeOfUseController.createPurposeOfUse);
router.patch("/update", protect, purposeOfUseController.updatePurposeOfUse);
router.get("/all", protect, purposeOfUseController.getAllPurposeOfUse);
router.delete(
  "/:purposeOfUseId",
  protect,
  purposeOfUseController.deletePurposeOfUse
);

module.exports = router;
