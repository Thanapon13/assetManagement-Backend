const express = require("express");
const assetController = require("../controller/assetController");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

// validate

const router = express.Router();

router.post(
  "/create",
  protect,
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  assetController.createAsset
);

router.patch(
  "/update/:assetId",
  protect,
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  assetController.updateAsset
);

router.patch("/deleteAsset/:assetId", protect, assetController.deleteAsset);

router.delete(
  "/deleteSubComponentAsset",
  protect,
  assetController.deleteSubComponentAsset
);

router.get("/", protect, assetController.getAllAsset);

router.get("/repairDropdown", assetController.getAllAssetForRepairDropdown);

// router.get("/building", assetController.getAllBuilding);

// // router.get("/department", assetController.getAllDepartment);

// router.get("/sector", assetController.getAllSector);

router.get("/sectorForSearch", protect, assetController.getSectorForSearch);

router.get("/search", protect, assetController.getBySearch);

router.get(
  "/searchProductSelector",
  protect,
  assetController.getByProductSelector
);

// ใช้คู่กัน
router.get(
  "/searchAssetNumberSelector",
  protect,
  assetController.getByAssetNumberSelector
);

router.get(
  "/searchQuantitySelector",
  protect,
  assetController.getQuantitySelector
);
router.get(
  "/getDepreciationByAssetNumber",
  protect,
  assetController.getDepreciationByAssetNumber
);
router.get(
  "/getAssetNumberByDropdowmSearch",
  protect,
  assetController.getAssetNumberByDropdowmSearch
);

router.get("/:assetId", protect, assetController.getAssetById);

module.exports = router;
