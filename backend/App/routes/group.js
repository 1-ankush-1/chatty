const express = require("express");
const router = express.Router();
const adminRoutes = require("./admin.js");
const groupController = require("../controllers/group.js");
const Authentication = require("../middlewares/authenticateUser.js");

router.get("/fetch_all", Authentication, groupController.fetchGroups);
router.get("/members", Authentication, groupController.fetchAllGroupMembers);
router.post("/create", Authentication, groupController.createGroup);
router.post("/leave", Authentication, groupController.userWantToLeaveGroup);
router.get("/add_request", groupController.wantToAddInGroup);                   //noAuth because we are sending form for user response
router.use("/admin", adminRoutes);                                              //seprated admin routes

module.exports = router;