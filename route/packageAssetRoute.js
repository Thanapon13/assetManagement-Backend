const express = require("express");
const packageAssetController = require("../controller/pkAssetController");
const upload = require("../middleware/upload");

const router = express.Router();
router.post(
  "/create",
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  packageAssetController.createPackageAsset
);

router.patch(
  "/update/:packageAssetId",
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  packageAssetController.updatePackageAsset
);

router.delete(
  "/deleteAsset/:packageAssetId",
  packageAssetController.deletePackageAsset
);

router.get("/", packageAssetController.getAllPackageAsset);
router.get("/sectorForSearch", packageAssetController.getSectorForSearch);
router.get("/search", packageAssetController.getPackageAssetBySearch);
router.get("/:packageAssetId", packageAssetController.getPackageAssetById);

module.exports = router;
