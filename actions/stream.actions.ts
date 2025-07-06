import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export const tokenProvider = (id: string) => {
  return async () => {
    if (!id) throw new Error("User ID required");

    const client = new StreamClient(apiKey!, apiSecret!);

    const exp = Math.round(Date.now() / 1000) + 60 * 60;
    const issued = Math.floor(Date.now() / 1000) - 60;

    return client.generateUserToken(id, exp, issued);
  };
};
