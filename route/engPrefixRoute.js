const express = require("express");
const engPrefixController = require("../controller/engPrefixController");

const router = express.Router();
router.post("/create", engPrefixController.createEngPrefix);
router.patch("/update", engPrefixController.updateEngPrefix);
router.get("/all", engPrefixController.getAllEngPrefix);
router.delete("/:engPrefixId", engPrefixController.deleteEngPrefix);

module.exports = router;
