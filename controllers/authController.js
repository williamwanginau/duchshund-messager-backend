const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseHelper = require("../helpers/responseHelper");
const { getUserInfo } = require("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (!username || !password || !email) {
      return res
        .status(400)
        .json(
          responseHelper.generateErrorResponse(400, "Please enter all fields")
        );
    }

    const user = await User.findOne({ email });
    if (user)
      return res
        .status(409)
        .json(
          responseHelper.generateErrorResponse(
            409,
            "This email is already registered"
          )
        );

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username, email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "User registered", {
        token,
      })
    );
  } catch (error) {
    res
      .status(400)
      .json(responseHelper.generateErrorResponse(400, "User already exists"));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user)
      return res
        .status(401)
        .json(
          responseHelper.generateErrorResponse(401, "Invalid email or password")
        );

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json(
          responseHelper.generateErrorResponse(401, "Invalid email or password")
        );

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const userInfo = await getUserInfo(req.userId, req.userToken);

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "Successful login", {
        token,
        user: userInfo,
      })
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(responseHelper.generateErrorResponse(500, "Internal server error"));
  }
};

const logout = async (req, res) => {
  res.status(200).json(
    responseHelper.generateSuccessResponse(200, "Successful logout", {
      token,
    })
  );
};

module.exports = { register, login, logout };
