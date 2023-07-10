const express = require("express");
const acquiredTypeController = require("../controller/acquiredTypeController");

const router = express.Router();
router.post("/create", acquiredTypeController.createAcquiredType);
router.patch("/update", acquiredTypeController.updateAcquiredType);
router.get("/all", acquiredTypeController.getAllAcquiredType);
router.delete("/:acquiredTypeId", acquiredTypeController.deleteAcquiredType);

module.exports = router;
