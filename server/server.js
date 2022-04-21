const express = require("express");
const app = express();
const port = 4700;
const cors = require("cors");

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

let roomMembers = {};
let socketRoom = {};

const users = new Map();
io.on("connection", (socket) => {
  console.log("socket connected..", socket.id);
  socket.on("register", function (data) {
    const room = data.documentId;
    socket.join(room);

    socketRoom[socket.id] = room;
    if (roomMembers[room]) {
      roomMembers[room].push({ id: socket.id, name: data.handle });
    } else {
      roomMembers[room] = [{ id: socket.id, name: data.handle }];
    }

    // Let all the clients know about new user to the document
    socket.to(room).emit("register", { id: socket.id, name: data.handle });
    // Post all the user list registered to this document
    io.in(room).emit("members", roomMembers[room]);
  });

  socket.on("connect_client", (user) => {
    console.log(`Client ${socket.id} connected`);
    users.set(socket.id, user);

    io.sockets.emit("update_clients", Array.from(users));
  });

  socket.on("client_connected", (user) => {
    console.log(`Client ${socket.id} connected`);
    users.set(socket.id, user);

    io.sockets.emit("update_clients", Array.from(users));
  });

  socket.on("set_cursor", (message) => {
    socket.broadcast.emit("update_cursor", message);
  });

  socket.on("set_selection", (message) => {
    socket.broadcast.emit("update_selection", message);
  });

  socket.on("set_content", (message) => {
    socket.broadcast.emit("update_content", message);
  });

  socket.on("disconnect", function (data) {
    console.log("Disconnected");
    let room = socketRoom[socket.id];
    const deleted = users.get(socket.id);
    users.delete(socket.id);
    if (room) {
      roomMembers[room] = roomMembers[room].filter(function (item) {
        return item.id !== socket.id;
      });
      if (roomMembers[room].length == 0) {
        delete roomMembers[room];
      }
      delete socketRoom[socket.id];
      socket.to(room).emit("userLeft", { id: socket.id });
      io.sockets.emit("delete_client", {
        user: deleted,
        key: socket.id,
      });
    }
  });
});

httpServer.listen(port);
