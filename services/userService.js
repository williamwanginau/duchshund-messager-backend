const User = require("../models/User");

const getUserInfo = async (userId, userToken) => {
  const user = await User.findById(userId)
    .populate({
      path: "friends.friendInfo",
      select: "username email",
    })
    .populate({
      path: "chatRooms",
      populate: {
        path: "members",
        select: "username email",
      },
    });

  return user;
};

module.exports = { getUserInfo };
