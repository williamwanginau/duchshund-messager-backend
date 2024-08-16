const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }

      return res.sendStatus(403);
    }

    req.userId = decoded.userId;
    req.userToken = token;
    next();
  });
};

module.exports = authMiddleware;
