const express = require("express");
const categoryController = require("../controller/categoryController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, categoryController.createCategory);
router.patch("/update", protect, categoryController.updateCategory);
router.get("/all", protect, categoryController.getAllCategory);
router.delete("/:categoryId", protect, categoryController.deleteCategory);

module.exports = router;
