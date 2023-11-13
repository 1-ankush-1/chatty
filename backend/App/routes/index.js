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
router.use("/message", Authentication, messageRoutes);
router.use("/group", groupRoutes);

//if no route found
//if no route found
router.use('/', (req, res, next) => {
    //get file path
    let filePath = path.join(__dirname, `../../public/components/${req.url}`);

    //check if the path exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        //if not or path is root, redirect to login page
        if (err || req.url === "/") {
            //adding absolute path so it doesnt add relative path in other request
            res.redirect(`${process.env.ALLOWED_DOMAIN}/frontend/component/login/html/login.html`);
        } else {
            res.sendFile(filePath);
        }
    });
});

module.exports = router;