"use client";
import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { exp } from "three/tsl";

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

interface StoryLine {
  id: string;
  text: string;
  author: User;
  timestamp: number;
}

interface StoryState {
  lines: StoryLine[];
  currentTurn: User | null;
  participants: User[];
  isActive: boolean;
  maxLines: number;
  currentLineCount: number;
}

const StoryBuilder = ({
  socket,
  currentUser,
  gameId,
  roomId,
  onExit,
}: GameProps) => {
  const [storyState, setStoryState] = useState<StoryState>({
    lines: [],
    currentTurn: null,
    participants: [currentUser],
    isActive: true,
    maxLines: 20,
    currentLineCount: 0,
  });

  const [currentLine, setCurrentLine] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const storyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Join the story game
    socket.emit("join-story-builder", { roomId, gameId, user: currentUser });

    // Listen for story updates
    socket.on("story-builder-update", (newStoryState: StoryState) => {
      setStoryState(newStoryState);
      setIsMyTurn(newStoryState.currentTurn?.userId === currentUser.userId);

      // Scroll to bottom when new line is added
      setTimeout(() => {
        if (storyContainerRef.current) {
          storyContainerRef.current.scrollTop =
            storyContainerRef.current.scrollHeight;
        }
      }, 100);
    });

    socket.on(
      "story-builder-player-joined",
      (data: { user: User; storyState: StoryState }) => {
        setStoryState(data.storyState);
      }
    );

    socket.on("story-builder-completed", (finalStory: StoryState) => {
      setStoryState(finalStory);
      setIsMyTurn(false);
    });

    return () => {
      socket.off("story-builder-update");
      socket.off("story-builder-player-joined");
      socket.off("story-builder-completed");
    };
  }, [socket, gameId, roomId, currentUser]);

  const submitLine = () => {
    if (!socket || !currentLine.trim() || !isMyTurn) return;

    const line: Omit<StoryLine, "id"> = {
      text: currentLine.trim(),
      author: currentUser,
      timestamp: Date.now(),
    };

    socket.emit("story-builder-add-line", {
      roomId,
      gameId,
      line,
    });

    setCurrentLine("");
  };

  const startNewStory = () => {
    if (!socket) return;
    socket.emit("story-builder-reset", { roomId, gameId });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitLine();
    }
  };

  const getPromptSuggestions = () => {
    const prompts = [
      "Once upon a time in a magical forest...",
      "The detective walked into the dimly lit room and noticed...",
      "On the last day of summer, Sarah discovered...",
      "The spaceship landed in the middle of the town square, and...",
      "Every morning at 7 AM, the old man would...",
      "The letter arrived 50 years too late, containing...",
      "In the depths of the ocean, something stirred...",
      "The door that had been locked for decades suddenly...",
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const exportStory = () => {
    const storyText = storyState.lines
      .map((line, index) => `${index + 1}. ${line.text}`)
      .join("\n");

    const blob = new Blob([storyText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `story-${gameId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusMessage = () => {
    if (storyState.currentLineCount >= storyState.maxLines) {
      return "📚 Story completed! Great collaborative work!";
    }

    if (isMyTurn) {
      return "✍️ Your turn to add to the story!";
    } else if (storyState.currentTurn) {
      return `⏳ Waiting for ${storyState.currentTurn.username} to continue...`;
    } else {
      return "🔄 Getting ready to start the story...";
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📚 Story Builder</h2>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Exit Game
        </button>
      </div>

      <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
        {/* Game Status */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">{getStatusMessage()}</p>
              <p className="text-sm text-gray-400">
                Lines: {storyState.currentLineCount}/{storyState.maxLines} •
                Players: {storyState.participants.length}
              </p>
            </div>
            {storyState.lines.length > 0 && (
              <button
                onClick={exportStory}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
              >
                💾 Export
              </button>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">👥 Story Contributors:</h3>
          <div className="flex flex-wrap gap-2">
            {storyState.participants.map((participant) => (
              <span
                key={participant.userId}
                className={`px-2 py-1 rounded text-sm ${
                  participant.userId === storyState.currentTurn?.userId
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {participant.username}
                {participant.userId === storyState.currentTurn?.userId && " ✍️"}
              </span>
            ))}
          </div>
        </div>

        {/* Story Display */}
        <div className="flex-1 mb-4 p-4 bg-gray-800 rounded-lg overflow-hidden">
          <h3 className="font-semibold mb-3">📖 Our Story:</h3>
          <div
            ref={storyContainerRef}
            className="h-full overflow-y-auto pr-2 space-y-3"
          >
            {storyState.lines.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p className="mb-4">🎭 No story lines yet!</p>
                <p className="text-sm mb-4">Start with something creative...</p>
                <div className="text-left bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-300 mb-2">💡 Suggestion:</p>
                  <p className="text-sm italic">"{getPromptSuggestions()}"</p>
                </div>
              </div>
            ) : (
              storyState.lines.map((line, index) => (
                <div
                  key={line.id}
                  className={`p-3 rounded-lg ${
                    line.author.userId === currentUser.userId
                      ? "bg-blue-900 border-l-4 border-blue-500"
                      : "bg-gray-700 border-l-4 border-gray-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-400">
                      Line {index + 1} • {line.author.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(line.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 rounded-lg p-4">
          {isMyTurn && storyState.currentLineCount < storyState.maxLines ? (
            <div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">
                    ✍️ Add your line to the story:
                  </label>
                  <textarea
                    value={currentLine}
                    onChange={(e) => setCurrentLine(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Continue the story... (Press Enter to submit, Shift+Enter for new line)"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-white"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {currentLine.length}/500 characters
                  </div>
                </div>
                <button
                  onClick={submitLine}
                  disabled={!currentLine.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">
              {storyState.currentLineCount >= storyState.maxLines ? (
                <div>
                  <p className="mb-4">🎉 Story completed!</p>
                  <button
                    onClick={startNewStory}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    📝 Start New Story
                  </button>
                </div>
              ) : (
                <p>⏳ Waiting for your turn...</p>
              )}
            </div>
          )}
        </div>

        {/* Game Instructions */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2 text-sm">📋 How to Play:</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Take turns adding lines to build a collaborative story</li>
            <li>• Each line should continue or build upon the previous ones</li>
            <li>• Be creative and have fun with the narrative!</li>
            <li>• Stories complete after {storyState.maxLines} lines</li>
            <li>• Export your completed story to save it</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default StoryBuilder;
