// app/api/update-socket-id/route.ts
import { NextRequest } from "next/server";
import User from "@/models/userModel";
import connectDb from "@/lib/dbConnect";

export async function POST(request: NextRequest) {
  connectDb();
  try {
    const { id, socketId } = await request.json();
    const user = await User.findById(id);
    await user.updateOne({ socketId });
    console.log("✅ Socket ID updated:", socketId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log("❌ Error while updating:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message }),
      { status: 500 }
    );
  }
}
