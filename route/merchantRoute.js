const express = require("express");
const router = express.Router();
const merchantController = require("../controller/merchantController");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

router.get("/all", protect, merchantController.getAllMerchant);
router.get("/search", protect, merchantController.getBySearch);
router.get("/searchViewOnly", protect, merchantController.getBySearchViewOnly);
router.get(
  "/getDropdownMerchant",
  protect,
  merchantController.getMerchantDropdown
);
router.get("/:merchantId", protect, merchantController.getMerchantById);
router.post(
  "/create",
  protect,
  upload.fields([{ name: "arrayDocument" }]),
  merchantController.createMerchant
);
router.patch(
  "/update/:merchantId",
  protect,
  upload.fields([{ name: "arrayDocument" }]),
  merchantController.updateMerchant
);

router.patch("/delete/:merchantId", protect, merchantController.deleteMerchant);
router.delete("/delete/all", protect, merchantController.deleteAll);

module.exports = router;
