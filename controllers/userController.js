const { userChanges } = require("../services/notificationService");
const { getUserInfo } = require("../services/userService");

const User = require("../models/UserModel");
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
      friendInfo: newFriend._id,
      status: "pending",
      createdAt,
    });

    newFriend.requests.push({
      friendInfo: user._id,
      status: "pending",
      createdAt,
    });

    await user.save();
    await newFriend.save();

    userChanges(user);
    userChanges(newFriend);

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
      path: "friends.friendInfo",
      select: "username email",
    });

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "User registered", {
        friends: user.friends,
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
    const userInfo = await getUserInfo(req.userId, req.userToken);

    res
      .status(200)
      .json(
        responseHelper.generateSuccessResponse(
          200,
          "User information retrieved successfully",
          { user: userInfo }
        )
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

const getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: "requests.friendInfo",
      select: "username email",
    });

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "Friend requests", {
        requests: user.requests,
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        responseHelper.generateErrorResponse(
          500,
          "Error getting friend requests: " + err.message
        )
      );
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { userId, requestId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(responseHelper.generateErrorResponse(404, "User not found"));
    }

    const request = user.requests.find((request) =>
      request._id.equals(requestId)
    );
    if (!request) {
      return res
        .status(404)
        .json(
          responseHelper.generateErrorResponse(404, "Friend request not found")
        );
    }

    const friendId = request.friendInfo._id;
    const friend = await User.findById(friendId);
    if (!friendId) {
      return res
        .status(404)
        .json(responseHelper.generateErrorResponse(404, "Friend not found"));
    }

    // update user's friends list
    user.friends.push({
      friendInfo: friendId,
      status: "accepted",
      createdAt: new Date(),
    });

    // remove request from user's requests list
    user.requests = user.requests.filter(
      (request) => !request._id.equals(requestId)
    );

    // update friend's friends list
    const friendRequest = friend.friends.find((friend) =>
      friend.friendInfo.equals(userId)
    );

    if (friendRequest) {
      friendRequest.status = "accepted";
    }

    await user.save();
    await friend.save();

    userChanges(user);
    userChanges(friend);

    return res.status(200).json(
      responseHelper.generateSuccessResponse(200, "Friend request accepted", {
        request,
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        responseHelper.generateErrorResponse(
          500,
          "Error accepting friend request: " + err.message
        )
      );
  }
};

module.exports = {
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getUser,
  searchUser,
};
