const express = require("express");
const countingUnitController = require("../controller/countingUnitController");

const router = express.Router();
router.post("/create", countingUnitController.createCountingUnit);
router.patch("/update", countingUnitController.updateCountingUnit);
router.get("/all", countingUnitController.getAllCountingUnit);
router.delete("/:countingUnitId", countingUnitController.deleteCountingUnit);

module.exports = router;
