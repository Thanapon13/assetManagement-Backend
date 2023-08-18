const express = require("express");
const sourceController = require("../controller/sourceController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, sourceController.createSource);
router.patch("/update", protect, sourceController.updateSource);
router.get("/all", protect, sourceController.getAllSource);
router.delete("/:sourceId", protect, sourceController.deleteSource);

module.exports = router;
