const express = require("express");
const groupController = require("../controller/groupController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, groupController.createGroup);
router.patch("/update", protect, groupController.updateGroup);
router.get("/all", protect, groupController.getAllGroup);
router.delete("/:groupId", protect, groupController.deleteGroup);

module.exports = router;
