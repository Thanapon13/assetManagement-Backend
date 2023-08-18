const express = require("express");
const moneyTypeController = require("../controller/moneyTypeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, moneyTypeController.createMoneyType);
router.patch("/update", protect, moneyTypeController.updateMoneyType);
router.get("/all", protect, moneyTypeController.getAllMoneyType);
router.delete("/:moneyTypeId", protect, moneyTypeController.deleteMoneyType);

module.exports = router;
