const express = require("express");
const router = express.Router();
const Authentication = require("../middlewares/authenticateUser")
const authRoutes = require("./auth.js");
const messageRoutes = require("./message.js");
const groupRoutes = require("./group.js");
const userRoutes = require("./user.js")
const path = require("path");
const fs = require("fs")

//all routes
router.use("/auth", authRoutes);
router.use("/user", Authentication, userRoutes);
router.use("/group", groupRoutes);
// router.use("/message",Authentication, messageRoutes);

//if no route found
router.use('/', (req, res, next) => {
    let filePath = path.join(__dirname, `../../public/components/${req.url}`);    //get file path

    //check if the path exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err || req.url === "/") {                                           //if not or path is root, redirect to login page
            res.redirect(`${process.env.ALLOWED_DOMAIN}/frontend/component/login/html/login.html`);   //adding absolute path so it doesnt add relative path in other request
        } else {
            res.sendFile(filePath);
        }
    });
});

module.exports = router;