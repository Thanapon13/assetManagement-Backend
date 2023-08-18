const express = require("express");
const borrowPurposeController = require("../controller/borrowPurposeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, borrowPurposeController.createBorrowPurpose);
router.patch("/update", protect, borrowPurposeController.updateBorrowPurpose);
router.get("/all", protect, borrowPurposeController.getAllBorrowPurpose);
router.delete(
  "/:borrowPurposeId",
  protect,
  borrowPurposeController.deleteBorrowPurpose
);

module.exports = router;
