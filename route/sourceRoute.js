const express = require("express");
const sourceController = require("../controller/sourceController");

const router = express.Router();
router.post("/create", sourceController.createSource);
router.patch("/update", sourceController.updateSource);
router.get("/all", sourceController.getAllSource);
router.delete("/:sourceId", sourceController.deleteSource);

module.exports = router;
