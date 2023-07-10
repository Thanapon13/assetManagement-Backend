const express = require("express");
const type8Controller = require("../controller/type8Controller");

const router = express.Router();
router.post("/create", type8Controller.createType8);
router.patch("/update", type8Controller.updateType8);
router.get("/all", type8Controller.getAllType8);
router.delete("/:type8Id", type8Controller.deleteType8);

module.exports = router;
