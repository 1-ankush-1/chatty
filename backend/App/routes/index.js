const express = require("express");
const router = express.Router();
// const Authentication = require("../middleware/authenticate-user.js")
const authRoutes = require("./auth.js");

router.use("/auth", authRoutes);

//if no route found
router.use((req, res, next) => {
    res.status(404).send("no routes found");
})

module.exports = router;