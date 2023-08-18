const express = require("express");
const companyPrefixController = require("../controller/companyPrefixController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, companyPrefixController.createCompanyPrefix);
router.patch("/update", protect, companyPrefixController.updateCompanyPrefix);
router.get("/all", protect, companyPrefixController.getAllCompanyPrefix);
router.delete(
  "/:companyPrefixId",
  protect,
  companyPrefixController.deleteCompanyPrefix
);

module.exports = router;
