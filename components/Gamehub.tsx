"use client";

import { useEffect, useState } from "react";

export default function Page(props: any) {
  const { socket, roomId, roomUsers, currentUser, socketId } = props;
  const [inviteReceived, setInviteReceived] = useState<string | null>(null);
  console.log(socketId);

  useEffect(() => {
    socket.on("invite-received", (gameId: string) => {
      setInviteReceived(gameId);
    });
    return () => {
      socket.off("invite-received");
    };
  }, [socketId]);

  function handleInvite(gameId: string) {
    console.log("Sending invite");
    socket.emit("invite-sent", { roomId, socket: socket.id, gameId });
    return () => {
      socket.off("invite-sent");
    };
  }
  return (
    <div className="grid gap-10 grid-cols-1">
      <button onClick={() => handleInvite("tictactoe")}>Tic tac toe</button>
      <button onClick={() => handleInvite("story")}>Story</button>
      <button onClick={() => handleInvite("guess")}>Guess</button>

      {inviteReceived && <p>Invite received for {inviteReceived}</p>}
    </div>
  );
}
