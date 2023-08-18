const express = require("express");
const hospitalController = require("../controller/hospitalController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, hospitalController.createHospital);
router.patch("/update", protect, hospitalController.updateHospital);
router.get("/all", protect, hospitalController.getAllHospital);
router.delete("/:hospitalId", protect, hospitalController.deleteHospital);

module.exports = router;
