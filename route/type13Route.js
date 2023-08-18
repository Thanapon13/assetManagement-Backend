const express = require("express");
const type13Controller = require("../controller/type13Controller");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create",protect, type13Controller.createType13);
router.patch("/update",protect, type13Controller.updateType13);
router.get("/all",protect, type13Controller.getAllType13);
router.delete("/:type13Id",protect, type13Controller.deleteType13);

module.exports = router;
