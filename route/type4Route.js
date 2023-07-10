const express = require("express");
const type4Controller = require("../controller/type4Controller");

const router = express.Router();
router.post("/create", type4Controller.createType4);
router.patch("/update", type4Controller.updateType4);
router.get("/all", type4Controller.getAllType4);
router.delete("/:type4Id", type4Controller.deleteType4);

module.exports = router;
