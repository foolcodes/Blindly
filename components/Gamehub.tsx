"use client";

import { useEffect, useState } from "react";

export default function Page({ socket, roomId, currentUser }: any) {
  const [inviteReceived, setInviteReceived] = useState<{
    gameId: string;
    from: string;
  } | null>(null);
  const [game, setGame] = useState<any>(null);
  const [gameRoom, setGameRoom] = useState<string>("");

  useEffect(() => {
    socket.on("invite-received", (data: { gameId: string; from: string }) => {
      setInviteReceived(data);
    });

    socket.on("game-started", (data: any) => {
      setGame(data);
      setGameRoom(`${socket.id}-${data.opponent}`);
    });

    socket.on("update-game", (data: any) => {
      setGame((prev: any) => ({ ...prev, ...data }));
    });

    return () => {
      socket.off("invite-received");
      socket.off("game-started");
      socket.off("update-game");
    };
  }, []);

  const sendInvite = (gameId: string) => {
    console.log("HII");
    socket.emit("invite-sent", { roomId, gameId });
  };

  const acceptInvite = () => {
    if (inviteReceived) {
      socket.emit("invite-accepted", {
        opponentSocketId: inviteReceived.from,
        gameId: inviteReceived.gameId,
        roomId,
      });
      setInviteReceived(null);
    }
  };

  const makeMove = (move: any) => {
    if (!gameRoom) return;
    socket.emit("make-move", { roomId, move });
  };

  return (
    <div className="grid gap-4">
      <div>
        <button onClick={() => sendInvite("tictactoe")}>
          Invite Tic Tac Toe
        </button>
        <button onClick={() => sendInvite("story")}>Invite Story</button>
        <button onClick={() => sendInvite("guess")}>Invite Guess</button>
      </div>

      {inviteReceived && (
        <div>
          <p>Invite received for {inviteReceived.gameId}</p>
          <button onClick={acceptInvite}>Accept</button>
        </div>
      )}

      {game && (
        <div>
          <p>Game started: {game.gameId}</p>
          <p>It's {game.turn === socket.id ? "your" : "opponent's"} turn</p>
          <button onClick={() => makeMove("my-move")}>Make Move</button>
        </div>
      )}
    </div>
  );
}
