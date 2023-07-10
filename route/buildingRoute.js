const express = require("express");
const buildingController = require("../controller/buildingController");

const router = express.Router();
router.post("/create", buildingController.createBuilding);
router.post("/createOrUpdate", buildingController.createOrUpdateBuilding);
router.patch("/update", buildingController.updateBuilding);
router.get("/all", buildingController.getAllBuilding);
router.delete("/:buildingId", buildingController.deleteBuilding);
router.delete("/floor/:floorId", buildingController.deleteFloor);
router.delete("/room/:roomId", buildingController.deleteRoom);

module.exports = router;
