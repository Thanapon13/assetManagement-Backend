const express = require("express");
const subSectorController = require("../controller/subSectorController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, subSectorController.createSubSector);
router.patch("/update", protect, subSectorController.updateSubSector);
router.get("/all", protect, subSectorController.getAllSubSector);
router.delete("/:subSectorId", protect, subSectorController.deleteSubSector);

module.exports = router;
