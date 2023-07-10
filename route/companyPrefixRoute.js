const express = require("express");
const companyPrefixController = require("../controller/companyPrefixController");

const router = express.Router();
router.post("/create", companyPrefixController.createCompanyPrefix);
router.patch("/update", companyPrefixController.updateCompanyPrefix);
router.get("/all", companyPrefixController.getAllCompanyPrefix);
router.delete("/:companyPrefixId", companyPrefixController.deleteCompanyPrefix);

module.exports = router;
