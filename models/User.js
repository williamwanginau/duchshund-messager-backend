const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  friendInfo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["accepted", "pending", "blocked"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const requestSchema = new mongoose.Schema({
  friendInfo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["accepted", "pending", "blocked"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const chatRoomSchema = new mongoose.Schema({
  type: { type: String, enum: ["private", "group"], required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  friends: [friendSchema],
  requests: [requestSchema],
  chatRooms: [chatRoomSchema],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
