const express = require("express");
const categoryController = require("../controller/categoryController");

const router = express.Router();
router.post("/create", categoryController.createCategory);
router.patch("/update", categoryController.updateCategory);
router.get("/all", categoryController.getAllCategory);
router.delete("/:categoryId", categoryController.deleteCategory);

module.exports = router;
