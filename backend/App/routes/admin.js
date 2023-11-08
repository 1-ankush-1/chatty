const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const Authentication = require("../middlewares/authenticateUser");
const cookieAuthentication = require("../middlewares/authenticateCookie");

router.delete("/member/:id", Authentication, adminController.removeMemberFromGroup);
router.get("/add_user", cookieAuthentication, Authentication, adminController.addUserInGroup);
router.post("/make_admin", Authentication, adminController.creatingAdminOfGroup);

module.exports = router;