const express = require("express");
const repairSectorController = require("../controller/repairSectorController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, repairSectorController.createRepairSector);
router.patch("/update", protect, repairSectorController.updateRepairSector);
router.get("/all", protect, repairSectorController.getAllRepairSector);
router.delete("/", protect, repairSectorController.deleteRepairSector);

module.exports = router;
