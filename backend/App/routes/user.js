const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const friendRequestRoutes = require("./friendRequest.js");

router.get("/by_name/:name", userController.getUsersByName);
router.use("/friend_request", friendRequestRoutes);

module.exports = router;