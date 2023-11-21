const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const passwordRoutes = require("./password");

router.post("/register-user", authController.registerUser);
router.use("/login-user", authController.loginUser);
router.use("/password", passwordRoutes);                //subRoutes of password

module.exports = router