const express = require("express");
const router = express.Router();
const repairController = require("../controller/repairController");
// const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/create", repairController.createRepair);
router.patch(
  "/updateStatusForGetJob/:repairId",
  repairController.updateStatusForGetJobRepair
);
router.patch(
  "/updateStatusForCheckJob/:repairId",
  repairController.updateStatusForCheckJobRepair
);

router.get("/getAll", repairController.getAllRepair);
router.get("/search", repairController.getBySearch);
router.get("/sectorForSearch", repairController.getSectorForSearch);
router.get(
  "/sectorForSearchDetailRecord",
  repairController.getSectorForSearchDetailRecord
);
router.get(
  "/sectorForSearchHistory",
  repairController.getSectorForSearchHistory
);
router.get("/searchTopApprove", repairController.getBySearchTopRepairApprove);
router.get("/searchDetailRecord", repairController.getBySearchOfDetailRecord);
router.get("/searchHistory", repairController.getBySearchOfHistory);

router.get(
  "/getHistoryThisAssetByAssetId",
  repairController.getHistoryThisAssetByAssetNumber
);
router.get("/searchOutsource", repairController.getBySearchOfOutsourceRapair);

router.get(
  "/getRepairTypeOutsourceForSearchOutsource",
  repairController.getRepairTypeOutsourceForSearchOutsource
);
router.get(
  "/getBuildingOutsourceForSearchOutsource",
  repairController.getBuildingOutsourceForSearchOutsource
);
router.get(
  "/getFloorForSearchOutsource",
  repairController.getFloorForSearchOutsource
);

router.patch("/delete/:repairId", repairController.deleteRepair);
router.patch("/offwork/:repairId", repairController.offWorkRepair);
router.patch("/approveAllWaiting", repairController.approveAllWaitingRepair);
router.patch("/rejectAllWaiting", repairController.rejectAllWaitingRepair);
router.patch(
  "/rejectIndividualWaiting",
  repairController.rejectIndividualWaitingRepair
);
router.patch(
  "/approveIndividualWaiting",
  repairController.approveIndividualWaitingRepair
);
router.patch("/update/:repairId", repairController.updateRepair);
router.patch("/recordDetail/:repairId", repairController.recordRepairDetail);
router.patch(
  "/outSourceRecord/:repairId",
  upload.fields([{ name: "arrayDocument" }]),
  repairController.outSourceRepairRecord
);
// router.get("/getAssetNumber", repairController.getAssetNumberSelector);
// router.get("/getAssetByAssetNumber", repairController.getAssetByAssetNumber);

router.get("/:repairId", repairController.getRepairById);

module.exports = router;
