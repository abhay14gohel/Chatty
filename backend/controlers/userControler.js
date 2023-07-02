const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const dotenv = require("dotenv");
const colors = require("colors");

dotenv.config();
// sending mails
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User Already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user.");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(404);
    throw new Error("Please enter all the fields");
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPasword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(404);
    throw new Error("Invalid Details");
  }
});

const sendEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(404);
    throw new Error("Please enter email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const sentOtp = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Chatty-OTP Verification",
      text: "OTP sent.",
    };

    const staus = await transporter.sendMail(
      {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Chatty-OTP Verification",
        text: `OTP for verification is ${generateOtp()}`,
      },
      function (err) {
        if (err) {
          res.status(404);
          throw new Error("Can not send Email.");
        } else {
          res.json({
            email: user.email,
            status: "success",
          });
        }
      }
    );
  } else {
    res.status(404);
    throw new Error("User Does not Exists.");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.send(users);
});

const generateOtp = () => {
  return Math.floor(Math.random() * (1000000 - 100000)) + 100000;
};
module.exports = { registerUser, authUser, sendEmail, allUsers };
