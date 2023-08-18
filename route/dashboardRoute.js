const express = require("express");
const dashboardController = require("../controller/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/searchAsset", protect, dashboardController.getAssetBySearch);
router.get("/searchRepair", protect, dashboardController.getRepairBySearch);
module.exports = router;
