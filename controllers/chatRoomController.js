const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");
const { userChanges } = require("../services/notificationService");
const { getChatRoomInfo } = require("../services/userService");

const responseHelper = require("../helpers/responseHelper");

const getChatroom = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.id);

    const chatRoomInfo = await getChatRoomInfo(chatRoom._id);

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "Chatroom found", {
        chatRoom: chatRoomInfo,
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        responseHelper.generateErrorResponse(
          500,
          "Error getting chatroom: " + err.message
        )
      );
  }
};

const createChatroom = async (req, res) => {
  try {
    const { name, members, type } = req.body;

    if (type === "private" && members.length === 2) {
      const existingChatRoom = await ChatRoom.findOne({
        members: { $all: members },
      });

      if (existingChatRoom) {
        return res
          .status(400)
          .json(
            responseHelper.generateErrorResponse(
              400,
              "Private chatroom already exists"
            )
          );
      }
    }

    const chatRoom = new ChatRoom({ name, members, type, messages: [] });
    await chatRoom.save();

    members.forEach(async (member) => {
      const user = await User.findById(member);
      user.chatRooms.push(chatRoom._id);
      await user.save();
      userChanges(user);
    });

    return res.status(201).json(
      responseHelper.generateSuccessResponse(201, "Chatroom created", {
        chatRoom,
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        responseHelper.generateErrorResponse(
          500,
          "Error creating chatroom: " + err.message
        )
      );
  }
};

module.exports = { createChatroom, getChatroom };
