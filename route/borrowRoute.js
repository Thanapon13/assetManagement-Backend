const express = require("express");
const router = express.Router();
const borrowController = require("../controller/borrowController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/create", protect, borrowController.createBorrow);
router.patch("/update/:borrowId", protect, borrowController.updateBorrow);

// router
//   .route('/')
//   .get(borrowController.getAllData)
//   .post(borrowController.createBorrowData)

router.patch("/delete/:borrowId", protect, borrowController.deleteBorrow);
router.patch(
  "/approveAllWaitingBorrow",
  protect,
  borrowController.approveAllWaitingBorrow
);
router.patch(
  "/rejectAllWaitingBorrow",
  protect,
  borrowController.rejectAllWaitingBorrow
);
router.patch(
  "/rejectIndividualWaitingBorrow",
  protect,
  borrowController.rejectIndividualWaitingBorrow
);

// borrowApproveDetail page
router.patch(
  "/partiallyApproveBorrowApproveDetail/:borrowId",
  protect,
  borrowController.partiallyApproveBorrowApproveDetail
);
router.patch(
  "/rejectAllBorrowApproveDetail/:borrowId",
  protect,
  borrowController.rejectAllBorrowApproveDetail
);

router.get("/", protect, borrowController.getAllBorrow);
router.get("/sectorForSearch", protect, borrowController.getSectorForSearch);
router.get(
  "/sectorForSearchCheckReturnBorrow",
  protect,
  borrowController.getSectorForSearchCheckReturnBorrow
);
router.get("/search", protect, borrowController.getBySearch);

router.get(
  "/searchTopBorrowApprove",
  protect,
  borrowController.getBySearchTopBorrowApprove
);

// borrowHistory page
router.get(
  "/searchBorrowHistory",
  protect,
  borrowController.getBySearchBorrowHistory
);
router.get(
  "/BorrowHistorySector",
  protect,
  borrowController.getBorrowHistorySector
);

// borrowCheck page
router.get(
  "/searchBorrowCheck",
  protect,
  borrowController.getBySearchBorrowCheck
);
router.get(
  "/borrowCheckSector",
  protect,
  borrowController.getBorrowCheckSector
);
// router.get("/borrowCheck/:borrowId", borrowController.getBorrowCheckById);
router.patch(
  "/borrowCheckSaving/:borrowId",
  protect,
  upload.fields([{ name: "arrayImage" }]),
  borrowController.updateBorrowCheckSavingById
);
router.patch(
  "/borrowCheckReturnApprove/:borrowId",
  protect,

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
  protect,
  borrowController.getAllSectorFromBorrow
);

// router.get(
//   "/viewBorrowApproveDetailById/:borrowId",
//   borrowController.getViewBorrowApproveDetailById
// );

router.get(
  "/viewBorrowHistoryByAssetId/:assetId",
  protect,
  borrowController.getViewBorrowHistoryByAssetId
);

router.get(
  "/viewBorrowHistoryByPackageAssetId/:packageAssetId",
  protect,
  borrowController.getViewBorrowHistoryByPackageAssetId
);

router.get("/:borrowId", protect, borrowController.getBorrowById);

module.exports = router;
