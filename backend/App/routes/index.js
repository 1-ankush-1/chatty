const express = require("express");
const router = express.Router();
const Authentication = require("../middlewares/authenticateUser")
const authRoutes = require("./auth.js");
const messageRoutes = require("./message.js");
const groupRoutes = require("./group.js");

router.use("/auth", authRoutes);
router.use("/message", Authentication, messageRoutes);
router.use("/group", groupRoutes);

//if no route found
router.use((req, res, next) => {
    res.status(404).send("no routes found");
})

module.exports = router;