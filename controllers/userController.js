const { notifyChanges } = require("../services/notificationService");

const User = require("../models/User");
const responseHelper = require("../helpers/responseHelper");

const sendFriendRequest = async (req, res) => {
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

    const friendRequest = user.friends.find((friend) =>
      friend._id.equals(newFriend._id)
    );

    if (friendRequest) {
      if (friendRequest.status === "pending") {
        return res
          .status(400)
          .json(
            responseHelper.generateErrorResponse(
              400,
              "Friend request already sent"
            )
          );
      }

      if (friendRequest.status === "accepted") {
        return res
          .status(400)
          .json(
            responseHelper.generateErrorResponse(400, "Friend already added")
          );
      }
    }

    const createdAt = new Date();

    user.friends.push({
      _id: newFriend._id,
      status: "pending",
      createdAt,
    });

    newFriend.requests.push({
      _id: user._id,
      status: "pending",
      createdAt,
    });

    notifyChanges(user._id, "UserInfoUpdated", {
      user: {
        _id: user._id,
        friends: user.friends,
        requests: newFriend.requests,
        email: user.email,
        username: user.username,
      },
    });

    await user.save();
    await newFriend.save();

    return res.status(200).json(
      responseHelper.generateSuccessResponse(200, "Friend request sent", {
        user,
      })
    );
  } catch (error) {
    return responseHelper.generateErrorResponse(500, {
      error: "Error adding friend: " + error.message,
    });
  }
};

const getFriends = async (req, res) => {
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
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "User registered", {
        user: {
          email: user.email,
          username: user.username,
          _id: user._id,
          token: req.userToken,
          friends: user.friends,
        },
      })
    );
  } catch (err) {
    res.status(500).json({ error: "Error getting user: " + err.message });
  }
};

const searchUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json(responseHelper.generateErrorResponse(404, "User not found"));
    }

    return res.status(200).json(
      responseHelper.generateSuccessResponse(200, "User found", {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
        },
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        responseHelper.generateErrorResponse(
          500,
          "Error searching user: " + err.message
        )
      );
  }
};

const getFriendRequests = async (req, res) => {};

const acceptFriendRequest = async (req, res) => {};

module.exports = {
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getUser,
  searchUser,
};
