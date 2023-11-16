const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/friendRequest");

router.post("/send", friendRequestController.sendRequest);
router.put("/handle/:contactId", friendRequestController.handleRequest);
router.get("/",friendRequestController.getRequests);

module.exports = router;