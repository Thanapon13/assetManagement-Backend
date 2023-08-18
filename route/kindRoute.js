const express = require("express");
const kindController = require("../controller/kindController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, kindController.createKind);
router.patch("/update", protect, kindController.updateKind);
router.get("/all", protect, kindController.getAllKind);
router.delete("/:kindId", protect, kindController.deleteKind);

module.exports = router;
