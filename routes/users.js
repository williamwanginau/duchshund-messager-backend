const express = require("express");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:userId/friends", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { friendId } = req.body;

    console.log(userId, friendId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.friends.push(friendId);
    await user.save();

    console.log(user);

    res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding friend: " + error.message });
  }
});

router.get("/:userId/friends", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log(user.friends);
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ error: "Error getting friends: " + error.message });
  }
});

router.get("/api/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    console.log("/api/user", user);

    res.status(200).json({
      user: {
        email: user.email,
        username: user.username,
        friends: user.friends,
        _id: user._id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error getting user: " + err.message });
  }
});

module.exports = router;
