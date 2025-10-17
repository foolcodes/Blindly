"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import TicTacToe from "./TicTacToe";
import StoryBuilder from "./StoryBuilder";
import WordGuess from "./WordGuess";

interface User {
  username: string;
  socketId: string;
  userId: string;
}

interface GameHubProps {
  socket: Socket | null;
  currentUser: User;
  roomUsers: User[];
  roomId: string;
}

type GameType = "none" | "ticTacToe" | "storyBuilder" | "wordGuess";

interface GameInvite {
  gameType: GameType;
  fromUser: User;
  toUser: User;
  gameId: string;
}

interface ActiveGame {
  id: string;
  type: GameType;
  players: User[];
  status: "waiting" | "playing" | "finished";
}

const GameHub = ({ socket, currentUser, roomUsers, roomId }: GameHubProps) => {
  const [currentGame, setCurrentGame] = useState<GameType>("none");
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string>("");

  useEffect(() => {
    console.log(roomUsers, "room users in GameHub");
    console.log(currentUser, "current user in GameHub");
    if (!socket) return;

    // Listen for game invites
    socket.on("game-invite", (invite: GameInvite) => {
      console.log("Received game invite:", invite);
      setGameInvites((prev) => [...prev, invite]);
    });

    // Listen for game invite responses
    socket.on(
      "game-invite-accepted",
      (data: { gameId: string; gameType: GameType }) => {
        setCurrentGame(data.gameType);
        setCurrentGameId(data.gameId);
        setGameInvites((prev) =>
          prev.filter((invite) => invite.gameId !== data.gameId)
        );
      }
    );

    socket.on("game-invite-declined", (data: { gameId: string }) => {
      setGameInvites((prev) =>
        prev.filter((invite) => invite.gameId !== data.gameId)
      );
    });

    // Listen for active games updates
    socket.on("active-games", (games: ActiveGame[]) => {
      setActiveGames(games);
    });

    socket.on("game-ended", (gameId: string) => {
      setActiveGames((prev) => prev.filter((game) => game.id !== gameId));
      if (currentGameId === gameId) {
        setCurrentGame("none");
        setCurrentGameId("");
      }
    });

    return () => {
      socket.off("game-invite");
      socket.off("game-invite-accepted");
      socket.off("game-invite-declined");
      socket.off("active-games");
      socket.off("game-ended");
    };
  }, [socket, currentGameId]);

  const sendGameInvite = (gameType: GameType, targetUser) => {
    if (!socket) return;
    console.log("send game invite", gameType, targetUser);

    const gameId = `${gameType}-${Date.now()}-${Math.random()}`;
    const invite: GameInvite = {
      gameType,
      fromUser: currentUser,
      toUser: targetUser,
      gameId,
    };

    socket.emit("send-game-invite", {
      roomId,
      invite,
    });
  };

  const respondToInvite = (invite: GameInvite, accept: boolean) => {
    if (!socket) return;

    socket.emit("respond-game-invite", {
      roomId,
      gameId: invite.gameId,
      accept,
      gameType: invite.gameType,
    });

    if (accept) {
      setCurrentGame(invite.gameType);
      setCurrentGameId(invite.gameId);
    }

    setGameInvites((prev) =>
      prev.filter((inv) => inv.gameId !== invite.gameId)
    );
  };

  const exitGame = () => {
    if (socket && currentGameId) {
      socket.emit("leave-game", { roomId, gameId: currentGameId });
    }
    setCurrentGame("none");
    setCurrentGameId("");
    setSelectedUser(null);
  };

  const otherUsers = roomUsers.filter((user) => user.socketId !== socket?.id);
  console.log(otherUsers, "other users in GameHub");

  if (currentGame !== "none") {
    const gameProps = {
      socket,
      currentUser,
      gameId: currentGameId,
      roomId,
      onExit: exitGame,
    };

    return (
      <div className="h-full bg-gray-900 text-white">
        {currentGame === "ticTacToe" && <TicTacToe {...gameProps} />}
        {currentGame === "storyBuilder" && <StoryBuilder {...gameProps} />}
        {currentGame === "wordGuess" && <WordGuess {...gameProps} />}
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">🎮 Game Hub</h2>

        {/* Game Invites */}
        {gameInvites.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900 rounded-lg">
            <h3 className="font-semibold mb-2">📨 Game Invites</h3>
            {gameInvites.map((invite) => (
              <div
                key={invite.gameId}
                className="flex items-center justify-between mb-2 p-2 bg-yellow-800 rounded"
              >
                <span className="text-sm">
                  {invite.fromUser.username} invited you to play{" "}
                  <span className="font-semibold">
                    {invite.gameType === "ticTacToe" && "Tic Tac Toe"}
                    {invite.gameType === "storyBuilder" && "Story Builder"}
                    {invite.gameType === "wordGuess" && "Word Guess"}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToInvite(invite, true)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToInvite(invite, false)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Games */}
        {activeGames.length > 0 && (
          <div className="mb-6 p-4 bg-blue-900 rounded-lg">
            <h3 className="font-semibold mb-2">🎯 Active Games</h3>
            {activeGames.map((game) => (
              <div key={game.id} className="mb-2 p-2 bg-blue-800 rounded">
                <div className="text-sm">
                  {game.type === "ticTacToe" && "⭕ Tic Tac Toe"}
                  {game.type === "storyBuilder" && "📚 Story Builder"}
                  {game.type === "wordGuess" && "🔤 Word Guess"}
                  {" - "}
                  <span className="text-gray-300">
                    {game.players.map((p) => p.username).join(" vs ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Online Users */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">
            👥 Online Users ({otherUsers.length})
          </h3>
          <div className="space-y-2">
            {otherUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-2 bg-gray-800 rounded"
              >
                <span className="text-sm">{user.userId}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => sendGameInvite("ticTacToe", user.userId)}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                    title="Invite to Tic Tac Toe"
                  >
                    ⭕
                  </button>
                  <button
                    onClick={() => sendGameInvite("storyBuilder", user.userId)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                    title="Invite to Story Builder"
                  >
                    📚
                  </button>
                  <button
                    onClick={() => sendGameInvite("wordGuess", user.userId)}
                    className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
                    title="Invite to Word Guess"
                  >
                    🔤
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2 Player Games */}
        <div>
          <h3 className="font-semibold mb-3">👥 2 Player Games</h3>
          <div className="p-4 bg-purple-700 hover:bg-purple-600 rounded-lg">
            <div className="font-semibold">⭕ Tic Tac Toe</div>
            <div className="text-sm text-gray-300">
              Classic 3x3 grid game - invite someone above!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
