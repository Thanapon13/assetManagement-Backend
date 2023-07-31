const express = require("express");
const router = express.Router();
const merchantController = require("../controller/merchantController");
const upload = require("../middleware/upload");

router.get("/all", merchantController.getAllMerchant);
router.get("/search", merchantController.getBySearch);
router.get("/searchViewOnly", merchantController.getBySearchViewOnly);
router.get("/getDropdownMerchant", merchantController.getMerchantDropdown);
router.get("/:merchantId", merchantController.getMerchantById);
router.post(
  "/create",
  upload.fields([{ name: "arrayDocument" }]),
  merchantController.createMerchant
);
router.patch(
  "/update/:merchantId",
  upload.fields([{ name: "arrayDocument" }]),
  merchantController.updateMerchant
);

router.patch("/delete/:merchantId", merchantController.deleteMerchant);
router.delete("/delete/all", merchantController.deleteAll);

module.exports = router;
