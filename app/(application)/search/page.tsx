"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

const Page = () => {
  const router = useRouter();
  const client = useStreamVideoClient();
  const [callDetails, setCallDetails] = useState<Call>();

  useEffect(() => {
    async function startSearch() {
      const profile = await axios.get("/api/profile");
      const { id } = profile.data;
      const response = await axios.get("/api/search");
      const roomId = response.data.roomId;
      if (!id || !client) return;

      try {
        const call = client.call("default", roomId);
        if (!call) throw new Error("Call not found");

        await call.getOrCreate();
        setCallDetails(call);
        router.push(`/match/${roomId}`);
      } catch (error) {}
    }

    startSearch();
  }, []);

  return <div>Searching...</div>;
};

export default Page;
