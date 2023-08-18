const express = require("express");
const acquisitionMethodController = require("../controller/acquisitionMethodController");
const protect = require("../middleware/authMiddleware");


const router = express.Router();
router.post("/create",  protect, acquisitionMethodController.createAcquisitionMethod);
router.patch("/update",  protect, acquisitionMethodController.updateAcquisitionMethod);
router.get("/all",  protect, acquisitionMethodController.getAllAcquisitionMethod);
router.delete("/:acquisitionMethodId",  protect, acquisitionMethodController.deleteAcquisitionMethod);

module.exports = router;
