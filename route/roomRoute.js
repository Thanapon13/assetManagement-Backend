const express = require("express");
const roomController = require("../controller/roomController");

const router = express.Router();
router.post("/create", roomController.createRoom);
router.patch("/update", roomController.updateRoom);
router.get("/all", roomController.getAllRoom);
router.delete("/", roomController.deleteRoom);

module.exports = router;
