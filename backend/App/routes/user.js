const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/by_name/:name", userController.getUsersByName);

module.exports = router;