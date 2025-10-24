import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectToMongoDB from "./db/config.js";
import { User } from "./model/model.js";
import jwt from "jsonwebtoken";

dotenv.config({
  path: ".env",
});

connectToMongoDB();
const router = express.Router();

router.post("/create/user", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res
        .status(400)
        .json({ message: "Missing credentials.", status: 400 });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exist in database.", status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const response = await User.create({
      username: `${firstname} ${lastname}`,
      email: email,
      password: hashedPassword,
    });

    if (!response) {
      return res
        .status(500)
        .json({ message: "User not created in database.", status: 500 });
    }

    return res
      .status(201)
      .json({ message: "User created in database.", status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Internal Server Error.",
      status: 500,
    });
  }
});

router.post("/login/user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({
      message: "User not found in database.",
      status: 404,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Invalid credentials", status: 400 });

  const token = jwt.sign(
    { email: user.email, username: user.username, userid: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    message: "Login success",
    username: user.username,
    email: user.email,
    token: token,
    status: 200,
  });
});

router.post("/delete/user", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({
      message: "User not found in database.",
      status: 404,
    });
  }

  const dbResponse = await User.deleteOne({ email: email });

  if (!dbResponse) {
    return res.status(500).json({
      message: "User not deleted.",
      status: 500,
    });
  }

  res.status(200).json({
    message: "User deleted successfully",
    status: 200,
  });
});

export default router;
