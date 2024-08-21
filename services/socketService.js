const socketIo = require("socket.io");
const ChatRoom = require("../models/ChatRoom");

let io;
const connectedUsers = {};

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User registered: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("sendMessage", async (msg) => {
      const { message, sender, chatRoomId } = msg;
      const createdAt = Date.now();

      await ChatRoom.findByIdAndUpdate(chatRoomId, {
        $push: { messages: { sender, message, createdAt } },
      });

      io.to(chatRoomId).emit("chatMessage", {
        message,
        sender,
        createdAt,
      });
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};

const getConnectedUsers = () => {
  return connectedUsers;
};

module.exports = { initSocket, getIo, getConnectedUsers };
