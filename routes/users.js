const express = require("express");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const responseHelper = require("../helpers/responseHelper");

router.post("/:userId/friends", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { friendEmail } = req.body;

    // if user not found
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json(responseHelper.generateErrorResponse(401, "User not found"));
    }

    // if friend email is the same as the user's email
    if (friendEmail === user.email) {
      return res
        .status(400)
        .json(
          responseHelper.generateErrorResponse(
            400,
            "Cannot add yourself as a friend"
          )
        );
    }

    // if friend email is not found
    const newFriend = await User.findOne({ email: friendEmail });
    if (!newFriend) {
      return res
        .status(404)
        .json(responseHelper.generateErrorResponse(404, "User not found"));
    }

    // if friend already added
    if (user.friends.find((friend) => friend._id.equals(newFriend._id))) {
      return res
        .status(400)
        .json(
          responseHelper.generateErrorResponse(400, "Friend already added")
        );
    }

    user.friends.push({
      _id: newFriend._id,
      status: "pending",
      createdAt: new Date(),
    });

    await user.save();

    return res
      .status(200)
      .json(
        responseHelper.generateSuccessResponse(200, "Friend added successfully")
      );
  } catch (error) {
    return responseHelper.generateErrorResponse(500, {
      error: "Error adding friend: " + error.message,
    });
  }
});

router.get("/:userId/friends", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: "friends._id",
      select: "username email",
    });

    const friendsWithDetails = user.friends.map((friend) => {
      if (friend._id) {
        return {
          _id: friend._id._id,
          username: friend._id.username,
          email: friend._id.email,
          status: friend.status,
          createdAt: friend.createdAt,
        };
      } else {
        return {
          _id: friend._id,
          status: friend.status,
          createdAt: friend.createdAt,
        };
      }
    });

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "User registered", {
        friends: friendsWithDetails,
      })
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(responseHelper.generateErrorResponse(500, "Error getting friends"));
  }
});

router.get("/api/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "User registered", {
        user: {
          email: user.email,
          username: user.username,
          _id: user._id,
          token: req.userToken,
        },
      })
    );
  } catch (err) {
    res.status(500).json({ error: "Error getting user: " + err.message });
  }
});

module.exports = router;
