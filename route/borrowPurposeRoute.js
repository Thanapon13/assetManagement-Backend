const express = require("express");
const borrowPurposeController = require("../controller/borrowPurposeController");

const router = express.Router();
router.post("/create", borrowPurposeController.createBorrowPurpose);
router.patch("/update", borrowPurposeController.updateBorrowPurpose);
router.get("/all", borrowPurposeController.getAllBorrowPurpose);
router.delete("/:borrowPurposeId", borrowPurposeController.deleteBorrowPurpose);

module.exports = router;
