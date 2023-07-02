const port = process.env.PORT || 5000;
const data = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const express = require("express");
const donenv = require("dotenv");
const colors = require("colors");
const { notFound, errorHandler } = require("./middleware/errormiddleware");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const app = express();
const path = require("path");
donenv.config();

app.use(express.json());
connectDB();

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// static files
const staticPath = path.join(__dirname, "../frontend/build");
const indexPath = path.join(__dirname, "../frontend/build/index.html");

app.use(express.static(staticPath));
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

// error handling
app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server.js: Success-Server running at ${port}`.bgGreen.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  // console.log(`connected to socket.io`);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.user not defined".bgRed);

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});
