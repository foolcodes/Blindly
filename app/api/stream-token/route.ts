import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { getTokenFromData } from "@/lib/getDataFromToken";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const { id, username } = getTokenFromData(request);

    if (!id) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const client = new StreamClient(apiKey, apiSecret);
    const token = client.generateUserToken({
      user_id: id,
      validity_in_seconds: 3600,
    });

    return NextResponse.json({ token, id, username });
  } catch (err: any) {
    console.error("STREAM TOKEN ROUTE ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
