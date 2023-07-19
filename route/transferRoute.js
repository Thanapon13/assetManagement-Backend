const express = require("express");
const transferController = require("../controller/transferController");

const router = express.Router();

router.post("/create", transferController.createTransfer);

// router.patch("/update/:transferId", transferController.updateTransfer);

router.patch("/delete/:transferId", transferController.deleteTransfer);

router.get("/searchAssetTransfer", transferController.getBySearch);

router.get("/all", transferController.getAllTransfer);

router.get(
  "/transferSectorForSearch",
  transferController.getTransferSectorForSearch
);

router.get(
  "/transfereeSectorForSearch",
  transferController.getTransfereeSectorForSearch
);

// // transferApprove page

router.get(
  "/searchTopTransferApprove",
  transferController.getBySearchTopTransferApprove
);

// ยังไม่ test
router.patch(
  "/approveAllWaitingTransfer",
  transferController.approveAllWaitingTransfer
);

router.patch(
  "/rejectAllWaitingTransfer",
  transferController.rejectAllWaitingTransfer
);

router.patch(
  "/rejectIndividualWaitingTransfer",
  transferController.rejectIndividualWaitingTransfer
);

// transferApproveDetail page
router.patch(
  "/partiallyApproveTransferApproveDetail/:transferId",
  transferController.partiallyApproveTransferApproveDetail
);

router.patch(
  "/rejectAllTransferApproveDetail/:transferId",
  transferController.rejectAllTransferApproveDetail
);

router.get(
  "/viewTransferApproveDetailById/:transferId",
  transferController.getViewTransferApproveDetailById
);

// // transferHistory page

router.get(
  "/searchTransferHistory",
  transferController.getBySearchTransferHistory
);
// router.get(
//   "/transferHistorySector",
//   transferController.getTransferHistorySector
// );

// router.get("/:transferId", transferController.getTransferById);

module.exports = router;
