const express = require("express");
const typeController = require("../controller/typeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, typeController.createType);
router.patch("/update", protect, typeController.updateType);
router.get("/all", protect, typeController.getAllType);
router.delete("/:typeId", protect, typeController.deleteType);

module.exports = router;
