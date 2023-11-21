const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

router.delete("/member/:id", adminController.removeMemberFromGroup);
router.get("/add_user", adminController.addUserInGroup);
router.put("/make_admin", adminController.creatingAdminOfGroup);
router.put("/remove_admin", adminController.removeAdminOfGroup);

module.exports = router;