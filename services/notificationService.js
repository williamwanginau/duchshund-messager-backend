const { getIo, getConnectedUsers } = require("./socketService");
const { getUserInfo } = require("./userService");

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

const userChanges = async (user) => {
  const userInfo = await getUserInfo(user._id, user.token);

  notifyChanges(user._id, "userInfoUpdated", {
    user: userInfo,
  });
};

module.exports = { notifyChanges, userChanges };
