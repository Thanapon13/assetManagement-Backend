const express = require("express");
const withdrawController = require("../controller/withdrawController");

const router = express.Router();
router.post("/create", withdrawController.createWithdraw);
router.patch("/:withdrawId", withdrawController.updateWithdraw);
router.delete("/deleteWithdraw/:id", withdrawController.deleteWithdraw);
router.delete("/deleteSubComponent", withdrawController.deleteSubComponent);
router.get("/searchAssetWithdraw", withdrawController.getBySearch);
router.get("/all", withdrawController.getAllWithdraw);

module.exports = router;
