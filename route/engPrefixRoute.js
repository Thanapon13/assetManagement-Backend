const express = require("express");
const engPrefixController = require("../controller/engPrefixController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, engPrefixController.createEngPrefix);
router.patch("/update", protect, engPrefixController.updateEngPrefix);
router.get("/all", protect, engPrefixController.getAllEngPrefix);
router.delete("/:engPrefixId", protect, engPrefixController.deleteEngPrefix);

module.exports = router;
