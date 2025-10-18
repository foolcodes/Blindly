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

const games = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", (currentUser, roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    rooms.get(roomId).push({ socketId: socket.id, currentUser });
    socket.join(roomId);
    console.log(`${currentUser} joined room ${roomId}`);
  });

  socket.on("invite-sent", ({ roomId, gameId }) => {
    const users = rooms.get(roomId);
    if (users) {
      users.forEach((user) => {
        if (user.socketId !== socket.id) {
          io.to(user.socketId).emit("invite-received", {
            gameId,
            from: socket.id,
          });
          console.log("ivite sent");
        }
      });
    }
  });

  socket.on("invite-accepted", ({ opponentSocketId, gameId, roomId }) => {
    console.log("ivite accepted");
    games.set(roomId, {
      players: [socket.id, opponentSocketId],
      turn: socket.id,
      state: {},
    });

    io.to(socket.id).emit("game-started", {
      gameId,
      opponent: opponentSocketId,
      turn: socket.id,
    });
    io.to(opponentSocketId).emit("game-started", {
      gameId,
      opponent: socket.id,
      turn: socket.id,
    });
  });

  socket.on("make-move", ({ roomId, move }) => {
    console.log(socket.id, "clicked");
    console.log(roomId);
    console.log(games);
    const game = games.get(roomId);
    console.log(game, "game");
    if (!game) return;

    if (socket.id !== game.turn) return;

    console.log(socket.id, "turn");
    game.state[socket.id] = move;

    game.turn = game.players.find((p) => p !== socket.id);

    game.players.forEach((player) => {
      io.to(player).emit("update-game", { move, turn: game.turn });
    });

    games.set(roomId, game);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    rooms.forEach((users, roomId) => {
      rooms.set(
        roomId,
        users.filter((u) => u.socketId !== socket.id)
      );
    });
  });
});

httpServer.listen(3001, () => {
  console.log("Server listening on port 3000");
});
