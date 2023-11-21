const express = require("express");
const router = express.Router();
const adminRoutes = require("./admin.js");
const groupController = require("../controllers/group.js");
const userController = require("../controllers/user.js");
const Authentication = require("../middlewares/authenticateUser.js");

router.post("/create", Authentication, groupController.createGroup);
router.get("/fetch_all", Authentication, userController.displayChatName);
router.get("/members", Authentication, groupController.fetchAllGroupMembers);
router.post("/leave", Authentication, groupController.userWantToLeaveGroup);
router.get("/add_request", groupController.wantToAddInGroup);                   //noAuth because we are sending form for user response
router.use("/admin", Authentication, adminRoutes);                                              //seprated admin subroutes

module.exports = router;