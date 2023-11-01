const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.post("/register-user", authController.registerUser);
router.use("/login-user", authController.loginUser);

module.exports = router