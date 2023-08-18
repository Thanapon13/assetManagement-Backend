const express = require("express");
const buildingController = require("../controller/buildingController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, buildingController.createBuilding);
router.post(
  "/createOrUpdate",
  protect,
  buildingController.createOrUpdateBuilding
);
router.patch("/update", protect, buildingController.updateBuilding);
router.get("/all", protect, buildingController.getAllBuilding);
router.delete("/:buildingId", protect, buildingController.deleteBuilding);
router.delete("/floor/:floorId", protect, buildingController.deleteFloor);
router.delete("/room/:roomId", protect, buildingController.deleteRoom);

module.exports = router;
