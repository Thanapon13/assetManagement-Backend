const express = require("express");
const withdrawController = require("../controller/withdrawController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, withdrawController.createWithdraw);
router.patch("/:withdrawId", protect, withdrawController.updateWithdraw);
router.delete(
  "/deleteWithdraw/:id",
  protect,
  withdrawController.deleteWithdraw
);
router.delete(
  "/deleteSubComponent",
  protect,
  withdrawController.deleteSubComponent
);
router.get("/searchAssetWithdraw", protect, withdrawController.getBySearch);
router.get("/all", protect, withdrawController.getAllWithdraw);

module.exports = router;
