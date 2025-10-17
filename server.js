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

const gameRooms = new Map();
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.emit("update-id", socket.id);
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log("✅ Client joined room:", roomId);
    console.log("socket id:", socket.id);
    userSockets.set(userId, {
      socketId: socket.id,
      userId: userId,
    });

    const users = Array.from(userSockets.values()).map((user) => ({
      socketId: user.socketId,
      userId: user.userId,
    }));
    io.to(roomId).emit("room-users", users);
  });

  socket.on("send-game-invite", ({ roomId, invite }) => {
    const targetUser = userSockets.get(invite.toUser);
    if (targetUser) {
      io.to(targetUser.socketId).emit("game-invite", invite);
      console.log("game invite sent to user", targetUser.userId);
    }
  });

  socket.on("respond-game-invite", ({ roomId, gameId, accept, gameType }) => {
    if (accept) {
      // Initialize game room
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, {
          id: gameId,
          type: gameType,
          players: [],
          roomId: roomId,
        });
      }

      io.to(roomId).emit("game-invite-accepted", { gameId, gameType });
    } else {
      io.to(roomId).emit("game-invite-declined", { gameId });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`);
});
