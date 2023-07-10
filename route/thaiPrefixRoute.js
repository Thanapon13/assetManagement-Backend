const express = require("express");
const thaiPrefixController = require("../controller/thaiPrefixController");

const router = express.Router();
router.post("/create", thaiPrefixController.createThaiPrefix);
router.patch("/update", thaiPrefixController.updateThaiPrefix);
router.get("/all", thaiPrefixController.getAllThaiPrefix);
router.delete("/:thaiPrefixId", thaiPrefixController.deleteThaiPrefix);

module.exports = router;
