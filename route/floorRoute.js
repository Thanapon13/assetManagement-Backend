const express = require("express");
const floorController = require("../controller/floorController");

const router = express.Router();
router.post("/create", floorController.createFloor);
router.patch("/update", floorController.updateFloor);
router.get("/all", floorController.getAllFloor);
router.delete("/", floorController.deleteFloor);

module.exports = router;
