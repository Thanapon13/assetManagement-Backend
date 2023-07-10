const express = require("express");
const type13Controller = require("../controller/type13Controller");

const router = express.Router();
router.post("/create", type13Controller.createType13);
router.patch("/update", type13Controller.updateType13);
router.get("/all", type13Controller.getAllType13);
router.delete("/:type13Id", type13Controller.deleteType13);

module.exports = router;
