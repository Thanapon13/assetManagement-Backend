const express = require("express");
const roomController = require("../controller/roomController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, roomController.createRoom);
router.patch("/update", protect, roomController.updateRoom);
router.get("/all", protect, roomController.getAllRoom);
router.delete("/", protect, roomController.deleteRoom);

module.exports = router;
