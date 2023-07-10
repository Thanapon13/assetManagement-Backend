const express = require("express");
const hospitalController = require("../controller/hospitalController");

const router = express.Router();
router.post("/create", hospitalController.createHospital);
router.patch("/update", hospitalController.updateHospital);
router.get("/all", hospitalController.getAllHospital);
router.delete("/:hospitalId", hospitalController.deleteHospital);

module.exports = router;
