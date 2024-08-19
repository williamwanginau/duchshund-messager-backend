const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const session = require("express-session");
require("dotenv").config();
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const chatRoomRoutes = require("./routes/chatroom");
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat";

const { initSocket } = require("./services/socketService");
// Middleware
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

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/chatroom", chatRoomRoutes);
// WebSocket setup
initSocket(server);

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
