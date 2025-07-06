"use client";
import { useCall, VideoPreview } from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const [isMicOn, setIsMicOn] = useState(true);

  const call = useCall();
  if (!call) throw new Error("Call is not available");

  useEffect(() => {
    if (isMicOn) {
      call.microphone.enable();
      call.camera.enable();
    } else {
      call.microphone.disable();
      call.camera.disable();
    }
    call.join();
    setIsSetupComplete(true);
  }, [isMicOn, call]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
      <h1 className="font-bold text-2xl">Setup your meeting</h1>
      <VideoPreview />

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setIsMicOn((prev) => !prev)}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
        >
          {isMicOn ? "Disable Mic & Camera" : "Enable Mic & Camera"}
        </button>
      </div>
    </div>
  );
};

export default MeetingSetup;
