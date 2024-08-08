const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const session = require("express-session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("./models/User");

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", async (ws, req) => {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    ws.close(1008, "Token missing");
    return;
  }

  let user;

  async function sendUserUpdate() {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      user = await User.findById(decoded.userId);
    } catch (error) {
      ws.close(1008, "Invalid token");
      return;
    }

    ws.send(
      JSON.stringify({
        type: "USER_UPDATE",
        user: {
          email: user.email,
          username: user.username,
          friends: user.friends,
          _id: user._id,
        },
      })
    );
  }

  sendUserUpdate();

  setInterval(sendUserUpdate, 1000);

  ws.on("close", () => {
    console.log("websocket disconnected");
  });

  ws.on("message", (message) => {
    console.log("received: %s", message);
  });

  ws.on("error", (err) => {
    console.error(err);
  });
});

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
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "1234",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the chat server");
});

io.on("connection", (socket) => {
  console.log("websocket connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("websocket disconnected");
  });
});

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
