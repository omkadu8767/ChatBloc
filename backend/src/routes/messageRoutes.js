const express = require("express");

const {
    sendMessage,
    getMessagesByUser,
    verifyMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/:userId", protect, getMessagesByUser);
router.post("/verify", protect, verifyMessage);

module.exports = router;
