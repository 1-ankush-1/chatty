const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/password");

router.post("/forget-password", passwordController.forgetPassword);
router.get("/reset-password/:forgetid", passwordController.resetPassword);
router.put("/update-password/:resetid", passwordController.updatePassword);

module.exports = router