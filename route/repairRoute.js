const express = require("express");
const router = express.Router();
const repairController = require("../controller/repairController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/create", protect, repairController.createRepair);
router.patch(
  "/updateStatusForGetJob/:repairId",
  protect,
  repairController.updateStatusForGetJobRepair
);
router.patch(
  "/updateStatusForCheckJob/:repairId",
  protect,
  repairController.updateStatusForCheckJobRepair
);

router.get("/getAll", protect, repairController.getAllRepair);
router.get("/search", protect, repairController.getBySearch);
router.get("/sectorForSearch", protect, repairController.getSectorForSearch);
router.get(
  "/sectorForSearchDetailRecord",
  protect,
  repairController.getSectorForSearchDetailRecord
);
router.get(
  "/sectorForSearchHistory",
  protect,
  repairController.getSectorForSearchHistory
);
router.get(
  "/searchTopApprove",
  protect,
  repairController.getBySearchTopRepairApprove
);
router.get(
  "/searchDetailRecord",
  protect,
  repairController.getBySearchOfDetailRecord
);
router.get("/searchHistory", protect, repairController.getBySearchOfHistory);

router.get(
  "/getHistoryThisAssetByAssetId",
  protect,
  repairController.getHistoryThisAssetByAssetNumber
);
router.get(
  "/searchOutsource",
  protect,
  repairController.getBySearchOfOutsourceRapair
);

router.get(
  "/getRepairTypeOutsourceForSearchOutsource",
  protect,
  repairController.getRepairTypeOutsourceForSearchOutsource
);
router.get(
  "/getBuildingOutsourceForSearchOutsource",
  protect,
  repairController.getBuildingOutsourceForSearchOutsource
);
router.get(
  "/getFloorForSearchOutsource",
  protect,
  repairController.getFloorForSearchOutsource
);

router.patch("/delete/:repairId", protect, repairController.deleteRepair);
router.patch("/offwork/:repairId", protect, repairController.offWorkRepair);
router.patch(
  "/approveAllWaiting",
  protect,
  repairController.approveAllWaitingRepair
);
router.patch(
  "/rejectAllWaiting",
  protect,
  repairController.rejectAllWaitingRepair
);
router.patch(
  "/rejectIndividualWaiting",
  protect,
  repairController.rejectIndividualWaitingRepair
);
router.patch(
  "/approveIndividualWaiting",
  protect,
  repairController.approveIndividualWaitingRepair
);
router.patch("/update/:repairId", protect, repairController.updateRepair);
router.patch(
  "/recordDetail/:repairId",
  protect,
  repairController.recordRepairDetail
);
router.patch(
  "/outSourceRecord/:repairId",
  protect,
  upload.fields([{ name: "arrayDocument" }]),
  repairController.outSourceRepairRecord
);
// router.get("/getAssetNumber", repairController.getAssetNumberSelector);
// router.get("/getAssetByAssetNumber", repairController.getAssetByAssetNumber);

router.get("/:repairId", protect, repairController.getRepairById);

module.exports = router;
