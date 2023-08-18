const express = require("express");
const thaiPrefixController = require("../controller/thaiPrefixController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, thaiPrefixController.createThaiPrefix);
router.patch("/update", protect, thaiPrefixController.updateThaiPrefix);
router.get("/all", protect, thaiPrefixController.getAllThaiPrefix);
router.delete("/:thaiPrefixId", protect, thaiPrefixController.deleteThaiPrefix);

module.exports = router;
