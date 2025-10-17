"use client";
import Loader from "@/components/Loader";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import GameHub from "@/components/Gamehub";
import { useGetCallById } from "@/hooks/useGetCallById";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const Page = () => {
  const { roomId } = useParams();
  const [user, setUser] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const { call, isCallLoading } = useGetCallById(roomId as string);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get("/api/profile");
        const userData = response.data;
        setUser(userData);

        const socketInstance = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
        );

        socketInstance.on("connect", () => {
          console.log("Connected to socket server");
        });

        socketInstance.emit("join-room", userData.id, roomId);

        socketInstance.on("room-users", (users) => {
          setRoomUsers(users);
          console.log("Room users:", users);
        });
        setSocket(socketInstance);

        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, [roomId]);

  const toggleGamesView = () => {
    setShowGames(!showGames);
  };

  if (isCallLoading || !user) {
    return <Loader />;
  }

  return (
    <div className="h-screen w-full relative">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <div className="flex h-full">
              {/* Main meeting area */}
              <div
                className={`transition-all duration-300 ${
                  showGames ? "w-1/2" : "w-full"
                }`}
              >
                <MeetingRoom />

                {/* Games toggle button */}
                <button
                  onClick={toggleGamesView}
                  className="absolute top-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
                >
                  {showGames ? "Hide Games" : "Show Games"}
                </button>
              </div>

              {/* Games panel */}
              {showGames && (
                <div className="w-1/2 bg-gray-900 border-l border-gray-700">
                  <GameHub
                    socket={socket}
                    socketId={socket?.id}
                    currentUser={user}
                    roomUsers={roomUsers}
                    roomId={roomId as string}
                  />
                </div>
              )}
            </div>
          )}
        </StreamTheme>
      </StreamCall>
    </div>
  );
};

export default Page;
