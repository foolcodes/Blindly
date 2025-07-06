import connectDb from "@/lib/dbConnect";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

connectDb();

export async function POST(request: NextRequest) {
  try {
    const { username, password, gender } = await request.json();
    if (!username || !password || !gender) {
      return NextResponse.json(
        { error: "Username or password is not present!" },
        { status: 400 }
      );
    }

    const userAlreadyPresent = await User.findOne({ username });
    if (userAlreadyPresent) {
      return NextResponse.json(
        { error: "A user with the same username is already present!" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      gender,
    });

    const userSaved = await user.save();
    if (userSaved) {
      return NextResponse.json(
        { message: "User signed up successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ error: "Error signing up!" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error signing up:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
