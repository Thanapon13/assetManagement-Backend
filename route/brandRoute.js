const express = require("express");
const brandController = require("../controller/brandController");

const router = express.Router();
router.post("/create", brandController.createBrand);
router.patch("/update", brandController.updateBrand);
router.get("/all", brandController.getAllBrand);
router.delete("/:brandId", brandController.deleteBrand);

module.exports = router;
