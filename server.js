import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connect", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("join-room", (currentUser, roomId, socketId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push({ currentUser, socketId });
  });

  socket.on("invite-sent", (roomId, socketId, gameId) => {
    const users = rooms.get(roomId);

    if (users) {
      for (const user of users) {
        if (user.socketId !== socket.id) {
          socket.emit("invite-received", { gameId });
        }
      }
    }
  });
});
