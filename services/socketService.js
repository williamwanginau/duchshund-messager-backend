const socketIo = require("socket.io");

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
    console.log(socket);
    console.log("New client connected");

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User registered: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
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
