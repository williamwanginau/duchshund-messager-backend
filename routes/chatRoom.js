const express = require("express");

const router = express.Router();

const {
  createChatroom,
  getChatroom,
} = require("../controllers/chatRoomController");

router.get("/:id", getChatroom);
router.post("/", createChatroom);

module.exports = router;
