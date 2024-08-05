const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const User = require("./models/User");

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const user1 = new User({ username: "Alice" });
    const user2 = new User({ username: "Bob", friends: [user1._id] });

    await user1.save();
    await user2.save();

    console.log("Users created");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  cors({
    origin: "http://localhost",
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the chat server");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
