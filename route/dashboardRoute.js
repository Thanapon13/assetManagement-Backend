const express = require("express");
const dashboardController = require("../controller/dashboardController");

const router = express.Router();
router.get("/searchAsset", dashboardController.getAssetBySearch);
// router.get("/searchRepair", dashboardController.getRepairBySearch);
module.exports = router;
