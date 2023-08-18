const express = require("express");
const sectorController = require("../controller/sectorController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, sectorController.createSector);
router.patch("/update", protect, sectorController.updateSector);
router.get("/all", protect, sectorController.getAllSector);
router.delete("/:sectorId", protect, sectorController.deleteSector);

module.exports = router;
