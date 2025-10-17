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

interface WordGuessState {
  word: string;
  guessedLetters: string[];
  correctLetters: string[];
  wrongLetters: string[];
  maxWrongGuesses: number;
  isGameOver: boolean;
  isWon: boolean;
  hint: string;
  category: string;
  participants: User[];
  currentGuesser: User | null;
}

const WordGuess = ({
  socket,
  currentUser,
  gameId,
  roomId,
  onExit,
}: GameProps) => {
  const [gameState, setGameState] = useState<WordGuessState>({
    word: "",
    guessedLetters: [],
    correctLetters: [],
    wrongLetters: [],
    maxWrongGuesses: 6,
    isGameOver: false,
    isWon: false,
    hint: "",
    category: "",
    participants: [currentUser],
    currentGuesser: currentUser,
  });

  const [selectedLetter, setSelectedLetter] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    if (!socket) return;

    // Join the word guess game
    socket.emit("join-word-guess", { roomId, gameId, user: currentUser });

    // Listen for game updates
    socket.on("word-guess-update", (newGameState: WordGuessState) => {
      setGameState(newGameState);
      setIsMyTurn(newGameState.currentGuesser?.userId === currentUser.userId);
    });

    socket.on(
      "word-guess-player-joined",
      (data: { user: User; gameState: WordGuessState }) => {
        setGameState(data.gameState);
      }
    );

    socket.on("word-guess-new-game", (newGameState: WordGuessState) => {
      setGameState(newGameState);
      setIsMyTurn(newGameState.currentGuesser?.userId === currentUser.userId);
    });

    return () => {
      socket.off("word-guess-update");
      socket.off("word-guess-player-joined");
      socket.off("word-guess-new-game");
    };
  }, [socket, gameId, roomId, currentUser]);

  const guessLetter = (letter: string) => {
    if (
      !socket ||
      !isMyTurn ||
      gameState.guessedLetters.includes(letter) ||
      gameState.isGameOver
    ) {
      return;
    }

    socket.emit("word-guess-letter", {
      roomId,
      gameId,
      letter: letter.toUpperCase(),
      userId: currentUser.userId,
    });
  };

  const startNewGame = () => {
    if (!socket) return;
    socket.emit("word-guess-new-game", { roomId, gameId });
  };

  const renderWord = () => {
    return gameState.word.split("").map((letter, index) => (
      <span
        key={index}
        className="inline-block w-8 h-10 mx-1 text-center text-2xl font-bold border-b-2 border-gray-500 text-white"
      >
        {gameState.correctLetters.includes(letter.toUpperCase()) ||
        gameState.isGameOver
          ? letter.toUpperCase()
          : ""}
      </span>
    ));
  };

  const renderHangman = () => {
    const wrongCount = gameState.wrongLetters.length;
    const parts = [
      "  ┌─┐",
      "  │ │",
      "  │ ●", // head
      "  │ │", // body
      "  │/ \\", // legs
      "──┴─────",
    ];

    return (
      <div className="font-mono text-lg leading-tight text-center">
        <div>{parts[0]}</div>
        <div>{parts[1]}</div>
        <div>{wrongCount >= 1 ? parts[2] : "  │"}</div>
        <div>{wrongCount >= 2 ? parts[3] : "  │"}</div>
        <div>
          {wrongCount >= 4 ? (wrongCount >= 5 ? parts[4] : "  │/") : "  │"}
        </div>
        <div>{parts[5]}</div>
      </div>
    );
  };

  const getStatusMessage = () => {
    if (gameState.isGameOver) {
      if (gameState.isWon) {
        return "🎉 Congratulations! You guessed the word!";
      } else {
        return `😞 Game Over! The word was: ${gameState.word}`;
      }
    }

    if (isMyTurn) {
      return "🎯 Your turn to guess a letter!";
    } else if (gameState.currentGuesser) {
      return `⏳ Waiting for ${gameState.currentGuesser.username} to guess...`;
    } else {
      return "🔄 Getting ready to start...";
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🔤 Word Guess</h2>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Exit Game
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Game Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">
          <div className="text-center">
            <p className="text-lg mb-2">{getStatusMessage()}</p>
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                Wrong guesses: {gameState.wrongLetters.length}/
                {gameState.maxWrongGuesses}
              </span>
              <span>Category: {gameState.category || "General"}</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl">
          {/* Hangman Drawing */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-center mb-4 font-semibold">Hangman</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                {renderHangman()}
              </div>
            </div>
          </div>

          {/* Word and Letters */}
          <div className="flex-1">
            {/* Word Display */}
            <div className="mb-6 p-6 bg-gray-800 rounded-lg">
              <h3 className="text-center mb-4 font-semibold">Word to Guess</h3>
              <div className="text-center mb-4">{renderWord()}</div>
              {gameState.hint && (
                <div className="text-center">
                  <span className="text-sm text-gray-400">💡 Hint: </span>
                  <span className="text-sm text-yellow-400">
                    {gameState.hint}
                  </span>
                </div>
              )}
            </div>

            {/* Letter Buttons */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-center mb-4 font-semibold">Letters</h3>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {alphabet.map((letter) => {
                  const isGuessed = gameState.guessedLetters.includes(letter);
                  const isCorrect = gameState.correctLetters.includes(letter);
                  const isWrong = gameState.wrongLetters.includes(letter);

                  return (
                    <button
                      key={letter}
                      onClick={() => guessLetter(letter)}
                      disabled={isGuessed || gameState.isGameOver || !isMyTurn}
                      className={`
                        w-10 h-10 rounded-lg font-bold transition-all
                        ${
                          isCorrect
                            ? "bg-green-600 text-white"
                            : isWrong
                            ? "bg-red-600 text-white"
                            : isGuessed
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : isMyTurn && !gameState.isGameOver
                            ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }
                      `}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              {/* Wrong Letters Display */}
              {gameState.wrongLetters.length > 0 && (
                <div className="text-center">
                  <span className="text-sm text-red-400">Wrong letters: </span>
                  <span className="text-sm text-red-300">
                    {gameState.wrongLetters.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">
          <h3 className="font-semibold mb-2 text-center">👥 Players:</h3>
          <div className="flex justify-center gap-4">
            {gameState.participants.map((participant) => (
              <span
                key={participant.userId}
                className={`px-3 py-1 rounded text-sm ${
                  participant.userId === gameState.currentGuesser?.userId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {participant.username}
                {participant.userId === gameState.currentGuesser?.userId &&
                  " 🎯"}
              </span>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        {gameState.isGameOver && (
          <div className="mt-6">
            <button
              onClick={startNewGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              🎮 New Game
            </button>
          </div>
        )}

        {/* Game Instructions */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">
          <h3 className="font-semibold mb-2">📋 How to Play:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Guess letters to reveal the hidden word</li>
            <li>
              • You have {gameState.maxWrongGuesses} wrong guesses before losing
            </li>
            <li>• Correct guesses reveal all instances of that letter</li>
            <li>
              • Win by guessing all letters before the hangman is complete
            </li>
            <li>• Take turns if playing with multiple people</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WordGuess;
