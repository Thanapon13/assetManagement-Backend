const express = require("express");
const assetController = require("../controller/assetController");
const upload = require("../middleware/upload");

// validate
// const assetValidator = require("../validators/assetValidator");
// const validator = require("../middleware/validator");

const router = express.Router();

router.post(
  "/create",
  upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
  assetController.createAsset
);

// router.patch(
//   "/update/:assetId",
//   upload.fields([{ name: "arrayImage" }, { name: "arrayDocument" }]),
//   assetController.updateAsset
// );

// router.patch("/deleteAsset/:assetId", assetController.deleteAsset);
// // router.delete(
// //   "/deleteSubComponentAsset",
// //   assetController.deleteSubComponentAsset
// // );

// router.get("/", assetController.getAllAsset);
// router.get("/repairDropdown", assetController.getAllAssetForRepairDropdown);
// // router.get("/building", assetController.getAllBuilding);
// // router.get("/department", assetController.getAllDepartment);
// router.get("/sector", assetController.getAllSector);
// router.get("/sectorForSearch", assetController.getSectorForSearch);
// router.get("/search", assetController.getBySearch);
// router.get("/searchProductSelector", assetController.getByProductSelector);

// // ใช้คู่กัน
// router.get(
//   "/searchAssetNumberSelector",
//   assetController.getByAssetNumberSelector
// );
// router.get("/searchQuantitySelector", assetController.getQuantitySelector);

// router.get("/:assetId", assetController.getAssetById);

module.exports = router;
