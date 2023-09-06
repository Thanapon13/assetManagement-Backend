const express = require("express");
const packageAssetController = require("../controller/pkAssetController");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post(
  "/create",
  protect,
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  packageAssetController.createPackageAsset
);

router.patch(
  "/update/:packageAssetId",
  protect,
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  packageAssetController.updatePackageAsset
);

router.delete(
  "/deleteAsset/:packageAssetId",
  protect,
  packageAssetController.deletePackageAsset
);
router.get(
  "/getAssetNumberAlreadyDistribution",
  protect,
  packageAssetController.getAssetNumberAlreadyDistribution
);
router.get("/", protect, packageAssetController.getAllPackageAsset);
router.get( 
  "/sectorForSearch",
  protect,
  packageAssetController.getSectorForSearch
);
router.get("/search", protect, packageAssetController.getPackageAssetBySearch);
router.get(
  "/:packageAssetId",
  protect,
  packageAssetController.getPackageAssetById
);

module.exports = router;
