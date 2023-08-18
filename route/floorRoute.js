const express = require("express");
const floorController = require("../controller/floorController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, floorController.createFloor);
router.patch("/update", protect, floorController.updateFloor);
router.get("/all", protect, floorController.getAllFloor);
router.delete("/", protect, floorController.deleteFloor);

module.exports = router;
