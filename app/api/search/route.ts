import Room from "@/models/roomsModel";
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/dbConnect";
import { randomUUID } from "crypto";
import { getTokenFromData } from "@/lib/getDataFromToken";

connectDb();

export async function GET(request: NextRequest) {
  try {
    const { id } = getTokenFromData(request);
    console.log("id", id);

    const room = await Room.findOne({ status: "waiting" });
    if (room) {
      room.users.push(id);
      room.status = "active";
      await room.save();
      return NextResponse.json({
        roomId: room.roomId,
        message: "Joined existing room",
      });
    }

    const newRoomId = randomUUID();
    const newRoom = await Room.create({
      roomId: newRoomId,
      users: [id],
      status: "waiting",
    });
    return NextResponse.json({
      message: "Created new room",
      roomId: newRoomId,
    });
  } catch (error: any) {
    console.error("Error matching user:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
