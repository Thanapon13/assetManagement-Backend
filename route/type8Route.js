const express = require("express");
const type8Controller = require("../controller/type8Controller");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, type8Controller.createType8);
router.patch("/update", protect, type8Controller.updateType8);
router.get("/all", protect, type8Controller.getAllType8);
router.delete("/:type8Id", protect, type8Controller.deleteType8);

module.exports = router;
