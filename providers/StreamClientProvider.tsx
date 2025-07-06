"use client";

import Loader from "@/components/Loader";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  useEffect(() => {
    async function CreateStreamUser() {
      const res = await axios.get("/api/stream-token", {
        withCredentials: true,
      });

      const { token, id, username } = res.data;

      const client = new StreamVideoClient({
        apiKey,
        user: {
          id,
          name: username,
        },
        tokenProvider: async () => token,
      });

      setVideoClient(client);
    }

    CreateStreamUser();
  }, []);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
