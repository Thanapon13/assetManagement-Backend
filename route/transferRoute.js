const express = require("express");
const transferController = require("../controller/transferController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", protect, transferController.createTransfer);

router.patch("/update/:transferId", protect, transferController.updateTransfer);

router.patch("/delete/:transferId", protect, transferController.deleteTransfer);

router.get("/searchAssetTransfer", protect, transferController.getBySearch);

router.get("/all", protect, transferController.getAllTransfer);

router.get(
  "/transferSectorForSearch",
  protect,
  transferController.getTransferSectorForSearch
);


router.get(
  "/transferSectorForSearchTransferApprove",
  protect,
  transferController.getTransferSectorForSearchTransferApprove
); 
router.get(
  "/transfereeSectorForSearch",
  protect,
  transferController.getTransfereeSectorForSearch
);

// // transferApprove page

router.get(
  "/searchTopTransferApprove",
  protect,
  transferController.getBySearchTopTransferApprove
);

// ยังไม่ test
router.patch(
  "/approveAllWaitingTransfer",
  protect,
  transferController.approveAllWaitingTransfer
);

router.patch(
  "/rejectAllWaitingTransfer",
  protect,
  transferController.rejectAllWaitingTransfer
);

router.patch(
  "/rejectIndividualWaitingTransfer",
  protect,
  transferController.rejectIndividualWaitingTransfer
);

// transferApproveDetail page
router.patch(
  "/partiallyApproveTransferApproveDetail/:transferId",
  protect,
  transferController.partiallyApproveTransferApproveDetail
);

router.patch(
  "/rejectAllTransferApproveDetail/:transferId",
  protect,
  transferController.rejectAllTransferApproveDetail
);

router.get(
  "/viewTransferApproveDetailById/:transferId",
  protect,
  transferController.getViewTransferApproveDetailById
);

// // transferHistory page

router.get(
  "/searchTransferHistory",
  protect,
  transferController.getBySearchTransferHistory
);
router.get(
  "/transferHistorySector",
  protect,
  transferController.getTransferHistorySector
);

router.get("/:transferId", protect, transferController.getTransferById);

module.exports = router;
