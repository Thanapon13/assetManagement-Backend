const express = require("express");
const brandController = require("../controller/brandController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, brandController.createBrand);
router.patch("/update", protect, brandController.updateBrand);
router.get("/all", protect, brandController.getAllBrandrand);
router.delete("/:brandId", protect, brandController.deleteBrand);

module.exports = router;
