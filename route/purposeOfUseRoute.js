const express = require("express");
const purposeOfUseController = require("../controller/purposeOfUseController");

const router = express.Router();
router.post("/create", purposeOfUseController.createPurposeOfUse);
router.patch("/update", purposeOfUseController.updatePurposeOfUse);
router.get("/all", purposeOfUseController.getAllPurposeOfUse);
router.delete("/:purposeOfUseId", purposeOfUseController.deletePurposeOfUse);

module.exports = router;
