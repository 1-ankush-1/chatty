const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.js");
const Authentication = require("../middlewares/authenticateUser.js");
const cookieAuthentication = require("../middlewares/authenticateCookie.js");

router.post("/create", Authentication, groupController.createGroup);
router.get("/fetchall", Authentication, groupController.fetchGroups);
router.post("/leave", Authentication, groupController.userWantToLeaveGroup);
router.delete("/remove-member/:id", Authentication, groupController.removeMemberFromGroup);
router.get("/members", Authentication, groupController.fetchAllGroupMembers);
router.get("/adduser", cookieAuthentication, Authentication, groupController.addUserInGroup);
router.get("/user-want-to-add", groupController.wantToAddInGroup);

module.exports = router;