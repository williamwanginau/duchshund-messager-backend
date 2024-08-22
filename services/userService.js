const User = require("../models/UserModel");
const ChatRoom = require("../models/ChatRoom");

const getUserInfo = async (userId, userToken) => {
  const user = await User.findById(userId)
    .populate({
      path: "friends.friendInfo",
      select: "username email",
    })

    .populate({
      path: "chatRooms._id",
      populate: {
        path: "members",
        select: "type",
      },
    });

  return user;
};

const getChatRoomInfo = async (chatRoomId) => {
  const chatRoom = await ChatRoom.findById(chatRoomId).populate({
    path: "members",
    select: "username email",
  });

  return chatRoom;
};

module.exports = { getUserInfo, getChatRoomInfo };
