const express = require("express");
const kindController = require("../controller/kindController");

const router = express.Router();
router.post("/create", kindController.createKind);
router.patch("/update", kindController.updateKind);
router.get("/all", kindController.getAllKind);
router.delete("/:kindId", kindController.deleteKind);

module.exports = router;
