const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

const { addUser, removeUser, getUser, getUsers } = require("./utils/users");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new websocket connection");

  socket.on("join", (option, callback) => {
    const { error, user } = addUser({ id: socket.id, ...option });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("admin", `${user.username} has jonied!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsers(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("bad-words are not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendlocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("admin", `${user.username} user left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsers(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("server is port on " + port);
});
