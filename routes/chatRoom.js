const express = require("express");

const router = express.Router();

const { createChatroom } = require("../controllers/chatRoomController");

router.post("/", createChatroom);

module.exports = router;
