const express = require("express");
const repairSectorController = require("../controller/repairSectorController");

const router = express.Router();
router.post("/create", repairSectorController.createRepairSector);
router.patch("/update", repairSectorController.updateRepairSector);
router.get("/all", repairSectorController.getAllRepairSector);
router.delete("/", repairSectorController.deleteRepairSector);

module.exports = router;
