const express = require("express");
const subSectorController = require("../controller/subSectorController");

const router = express.Router();
router.post("/create", subSectorController.createSubSector);
router.patch("/update", subSectorController.updateSubSector);
router.get("/all", subSectorController.getAllSubSector);
router.delete("/:subSectorId", subSectorController.deleteSubSector);

module.exports = router;
