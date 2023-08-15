const express = require("express");
const acquisitionMethodController = require("../controller/acquisitionMethodController");

const router = express.Router();
router.post("/create", acquisitionMethodController.createAcquisitionMethod);
router.patch("/update", acquisitionMethodController.updateAcquisitionMethod);
router.get("/all", acquisitionMethodController.getAllAcquisitionMethod);
router.delete(
  "/:acquisitionMethodId",
  acquisitionMethodController.deleteAcquisitionMethod
);

module.exports = router;
