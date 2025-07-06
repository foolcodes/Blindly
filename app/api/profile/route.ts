import { getTokenFromData } from "@/lib/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { username, id } = getTokenFromData(request);
    return NextResponse.json({ username, id });
  } catch (error: any) {
    console.log("Error finding username from jwt");
    NextResponse.json({ error: error.message });
  }
}
