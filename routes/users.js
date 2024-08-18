const express = require("express");
const router = express.Router();
const {
  sendFriendRequest,
  getFriends,
  getUser,
  searchUser,
  getFriendRequests,
  acceptFriendRequest,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// 取得好友邀請列表
router.get("/:userId/friends/requests", getFriendRequests);
router.post("/:userId/friends/requests", acceptFriendRequest);
router.post("/:userId/friends", sendFriendRequest);
router.get("/:userId/friends", getFriends);
router.get("/", getUser);
router.get("/search/:email", searchUser);

module.exports = router;
