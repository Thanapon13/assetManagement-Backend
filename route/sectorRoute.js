const express = require("express");
const sectorController = require("../controller/sectorController");

const router = express.Router();
router.post("/create", sectorController.createSector);
router.patch("/update", sectorController.updateSector);
router.get("/all", sectorController.getAllSector);
router.delete("/:sectorId", sectorController.deleteSector);

module.exports = router;
