const express = require("express");
const docterTypeController = require("../controller/docterTypeController");

const router = express.Router();
router.post("/create", docterTypeController.createDocterType);
router.patch("/update", docterTypeController.updateDocterType);
router.get("/all", docterTypeController.getAllDocterType);
router.delete("/:docterTypeId", docterTypeController.deleteDocterType);

module.exports = router;
