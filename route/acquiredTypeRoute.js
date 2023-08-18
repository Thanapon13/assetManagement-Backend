const express = require("express");
const acquiredTypeController = require("../controller/acquiredTypeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, acquiredTypeController.createAcquiredType);
router.patch("/update", protect, acquiredTypeController.updateAcquiredType);
router.get("/all", protect, acquiredTypeController.getAllAcquiredType);
router.delete(
  "/:acquiredTypeId",
  protect,
  acquiredTypeController.deleteAcquiredType
);

module.exports = router;
