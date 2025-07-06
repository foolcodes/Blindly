"use client";

import {
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import React from "react";

const MeetingRoom = () => {
  const [showParticipants, setShowParticipants] = React.useState(false);
  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 bg-black text-white ">
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <SpeakerLayout participantsBarPosition="right" />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls />
      </div>
    </section>
  );
};

export default MeetingRoom;
