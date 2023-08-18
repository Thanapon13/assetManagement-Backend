const express = require("express");
const countingUnitController = require("../controller/countingUnitController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, countingUnitController.createCountingUnit);
router.patch("/update", protect, countingUnitController.updateCountingUnit);
router.get("/all", protect, countingUnitController.getAllCountingUnit);
router.delete(
  "/:countingUnitId",
  protect,
  countingUnitController.deleteCountingUnit
);

module.exports = router;
