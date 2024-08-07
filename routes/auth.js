const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "williaminau";
const responseHelper = require("../helpers/responseHelper");

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (!username || !password || !email) {
      return res
        .status(400)
        .json(
          responseHelper.generateErrorResponse(400, "Please enter all fields")
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });
    await user.save();

    const token = jwt.sign({ userId: user._id, username, email }, JWT_SECRET, {
      expiresIn: "1h",
    });

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
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(401)
        .json(
          responseHelper.generateErrorResponse(401, "Invalid email or password")
        );

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

    res.status(200).json(
      responseHelper.generateSuccessResponse(200, "Successful login", {
        token,
      })
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(responseHelper.generateErrorResponse(500, "Internal server error"));
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json(
    responseHelper.generateSuccessResponse(200, "Successful logout", {
      token,
    })
  );
});

module.exports = router;
