"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface User {
  username: string;
  socketId: string;
  userId: string;
}

interface GameProps {
  socket: Socket | null;
  currentUser: User;
  gameId: string;
  roomId: string;
  onExit: () => void;
}

type Player = "X" | "O" | null;
type Board = Player[];

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | "tie" | null;
  players: {
    X: User | null;
    O: User | null;
  };
  isGameActive: boolean;
}

const TicTacToe = ({
  socket,
  currentUser,
  gameId,
  roomId,
  onExit,
}: GameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    players: { X: null, O: null },
    isGameActive: false,
  });

  const [mySymbol, setMySymbol] = useState<Player>(null);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);

  useEffect(() => {
    if (!socket) return;

    // Join the game
    socket.emit("join-tic-tac-toe", { roomId, gameId, user: currentUser });

    // Listen for game updates
    socket.on("tic-tac-toe-update", (newGameState: GameState) => {
      setGameState(newGameState);
      setWaitingForPlayer(!newGameState.isGameActive);
    });

    socket.on(
      "tic-tac-toe-player-joined",
      (data: { symbol: Player; gameState: GameState }) => {
        setMySymbol(data.symbol);
        setGameState(data.gameState);
        if (data.gameState.isGameActive) {
          setWaitingForPlayer(false);
        }
      }
    );

    socket.on("tic-tac-toe-player-left", () => {
      setWaitingForPlayer(true);
      setGameState((prev) => ({ ...prev, isGameActive: false }));
    });

    return () => {
      socket.off("tic-tac-toe-update");
      socket.off("tic-tac-toe-player-joined");
      socket.off("tic-tac-toe-player-left");
    };
  }, [socket, gameId, roomId, currentUser]);

  const makeMove = (index: number) => {
    if (
      !socket ||
      !gameState.isGameActive ||
      gameState.board[index] ||
      gameState.winner
    )
      return;
    if (gameState.currentPlayer !== mySymbol) return;

    socket.emit("tic-tac-toe-move", {
      roomId,
      gameId,
      index,
      player: mySymbol,
    });
  };

  const resetGame = () => {
    if (!socket) return;
    socket.emit("tic-tac-toe-reset", { roomId, gameId });
  };

  const renderCell = (index: number) => {
    const value = gameState.board[index];
    return (
      <button
        key={index}
        onClick={() => makeMove(index)}
        className={`
          w-20 h-20 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 
          text-3xl font-bold transition-colors rounded-lg
          ${
            value === "X"
              ? "text-blue-400"
              : value === "O"
              ? "text-red-400"
              : "text-gray-500"
          }
          ${
            gameState.currentPlayer === mySymbol &&
            !value &&
            gameState.isGameActive
              ? "cursor-pointer"
              : "cursor-not-allowed"
          }
        `}
        disabled={
          !!value ||
          gameState.winner !== null ||
          !gameState.isGameActive ||
          gameState.currentPlayer !== mySymbol
        }
      >
        {value}
      </button>
    );
  };

  const getStatusMessage = () => {
    if (waitingForPlayer) {
      return "🔄 Waiting for another player to join...";
    }

    if (gameState.winner === "tie") {
      return "🤝 It's a tie!";
    }

    if (gameState.winner) {
      const winnerUser = gameState.players[gameState.winner];
      return `🎉 ${winnerUser?.username || gameState.winner} wins!`;
    }

    if (gameState.currentPlayer === mySymbol) {
      return "🎯 Your turn!";
    } else {
      const currentPlayerUser = gameState.players[gameState.currentPlayer];
      return `⏳ ${
        currentPlayerUser?.username || gameState.currentPlayer
      }'s turn`;
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">⭕ Tic Tac Toe</h2>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Exit Game
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Game Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg w-full max-w-md">
          <div className="text-center">
            <p className="text-lg mb-2">{getStatusMessage()}</p>
            {mySymbol && (
              <p className="text-sm text-gray-400">
                You are playing as{" "}
                <span
                  className={
                    mySymbol === "X" ? "text-blue-400" : "text-red-400"
                  }
                >
                  {mySymbol}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Players Info */}
        {gameState.isGameActive && (
          <div className="mb-6 flex justify-between w-full max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-xl font-bold">X</span>
              <span className="text-sm">
                {gameState.players.X?.username || "Player X"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xl font-bold">O</span>
              <span className="text-sm">
                {gameState.players.O?.username || "Player O"}
              </span>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {gameState.board.map((_, index) => renderCell(index))}
        </div>

        {/* Game Controls */}
        {(gameState.winner || !gameState.isGameActive) && !waitingForPlayer && (
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {/* Game Instructions */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg w-full max-w-md">
          <h3 className="font-semibold mb-2">📋 How to Play:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Take turns placing your symbol (X or O)</li>
            <li>• Get 3 in a row (horizontal, vertical, or diagonal) to win</li>
            <li>• Click on an empty square to make your move</li>
            <li>• Game ends when someone wins or the board is full</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
