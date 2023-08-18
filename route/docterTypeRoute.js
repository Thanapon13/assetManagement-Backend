const express = require("express");
const docterTypeController = require("../controller/docterTypeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, docterTypeController.createDocterType);
router.patch("/update", protect, docterTypeController.updateDocterType);
router.get("/all", protect, docterTypeController.getAllDocterType);
router.delete("/:docterTypeId", protect, docterTypeController.deleteDocterType);

module.exports = router;
