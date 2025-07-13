import connectDb from "@/lib/dbConnect";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connectDb();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username or password is not present!" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with the specific username" },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );
    }
    const tokenData = {
      id: user._id,
      username: user.username,
      gender: user.gender,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json(
      { message: "Logged in successfully" },
      { status: 201 }
    );
    response.cookies.set("token", token, { httpOnly: true });
    return response;
  } catch (error) {
    console.error("Error signing in:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
