const express = require("express");
const moneyTypeController = require("../controller/moneyTypeController");

const router = express.Router();
router.post("/create", moneyTypeController.createMoneyType);
router.patch("/update", moneyTypeController.updateMoneyType);
router.get("/all", moneyTypeController.getAllMoneyType);
router.delete("/:moneyTypeId", moneyTypeController.deleteMoneyType);

module.exports = router;
