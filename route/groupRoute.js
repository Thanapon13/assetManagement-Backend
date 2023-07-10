const express = require("express");
const groupController = require("../controller/groupController");

const router = express.Router();
router.post("/create", groupController.createGroup);
router.patch("/update", groupController.updateGroup);
router.get("/all", groupController.getAllGroup);
router.delete("/:groupId", groupController.deleteGroup);

module.exports = router;
