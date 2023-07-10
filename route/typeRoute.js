const express = require("express");
const typeController = require("../controller/typeController");

const router = express.Router();
router.post("/create", typeController.createType);
router.patch("/update", typeController.updateType);
router.get("/all", typeController.getAllType);
router.delete("/:typeId", typeController.deleteType);

module.exports = router;
