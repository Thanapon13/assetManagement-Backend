const express = require("express");
const type4Controller = require("../controller/type4Controller");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, type4Controller.createType4);
router.patch("/update", protect, type4Controller.updateType4);
router.get("/all", protect, type4Controller.getAllType4);
router.delete("/:type4Id", protect, type4Controller.deleteType4);

module.exports = router;
