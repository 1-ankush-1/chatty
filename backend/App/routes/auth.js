const express = require("express");
const router = express.Router();
// const Authentication = require("../middleware/authenticate-user.js")
const authController = require("../controllers/auth");

router.post("/register-user", authController.registerUser);
router.use("/login-user", authController.loginUser);

module.exports = router