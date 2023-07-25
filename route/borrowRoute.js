const express = require("express");
const router = express.Router();
const borrowController = require("../controller/borrowController");
// const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/create", borrowController.createBorrow);
// router.patch("/update/:borrowId", borrowController.updateBorrow);

// router
//   .route('/')
//   .get(borrowController.getAllData)
//   .post(borrowController.createBorrowData)

router.patch("/delete/:borrowId", borrowController.deleteBorrow);
router.patch(
  "/approveAllWaitingBorrow",
  borrowController.approveAllWaitingBorrow
);
router.patch(
  "/rejectAllWaitingBorrow",
  borrowController.rejectAllWaitingBorrow
);
router.patch(
  "/rejectIndividualWaitingBorrow",
  borrowController.rejectIndividualWaitingBorrow
);

// borrowApproveDetail page
router.patch(
  "/partiallyApproveBorrowApproveDetail/:borrowId",
  borrowController.partiallyApproveBorrowApproveDetail
);
router.patch(
  "/rejectAllBorrowApproveDetail/:borrowId",
  borrowController.rejectAllBorrowApproveDetail
);

router.get("/", borrowController.getAllBorrow);
router.get("/sectorForSearch", borrowController.getSectorForSearch);
router.get("/sectorForSearchCheckReturnBorrow", borrowController.getSectorForSearchCheckReturnBorrow);
router.get("/search", borrowController.getBySearch);

router.get(
  "/searchTopBorrowApprove",
  borrowController.getBySearchTopBorrowApprove
);

// borrowHistory page
router.get("/searchBorrowHistory", borrowController.getBySearchBorrowHistory);
router.get("/BorrowHistorySector", borrowController.getBorrowHistorySector);

// borrowCheck page
router.get("/searchBorrowCheck", borrowController.getBySearchBorrowCheck);
router.get("/borrowCheckSector", borrowController.getBorrowCheckSector);
// router.get("/borrowCheck/:borrowId", borrowController.getBorrowCheckById);
router.patch(
  "/borrowCheckSaving/:borrowId",
  borrowController.updateBorrowCheckSavingById
);
router.patch(
  "/borrowCheckReturnApprove/:borrowId",
  upload.fields([{ name: "arrayImage" }]),
  borrowController.updateBorrowCheckReturnApproveById
);

// status first fetch
// router.get(
//   "/allFirstFetchBorrowApprove",
//   borrowController.getAllFirstFetchBorrowApprove
// );
// // dropdown
router.get(
  "/dropdownAllSectorFromBorrow",
  borrowController.getAllSectorFromBorrow
);

// router.get(
//   "/viewBorrowApproveDetailById/:borrowId",
//   borrowController.getViewBorrowApproveDetailById
// );

router.get(
  "/viewBorrowHistoryByAssetId/:assetId",
  borrowController.getViewBorrowHistoryByAssetId
);

router.get(
  "/viewBorrowHistoryByPackageAssetId/:packageAssetId",
  borrowController.getViewBorrowHistoryByPackageAssetId
);

router.get("/:borrowId", borrowController.getBorrowById);

module.exports = router;
