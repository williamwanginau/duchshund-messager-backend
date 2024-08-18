const { getIo, getConnectedUsers } = require("./socketService");

const notifyChanges = (userId, changeType, data) => {
  const connectedUsers = getConnectedUsers();
  const io = getIo();
  const socketId = connectedUsers[userId];

  if (socketId) {
    io.to(socketId).emit(changeType, data);
  } else {
    console.error(`User ${userId} is not connected`);
  }
};

module.exports = { notifyChanges };
