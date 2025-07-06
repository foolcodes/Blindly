import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
export const getTokenFromData = (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value || "";
    if (token) {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!);
      console.log(decodedToken);
      return decodedToken;
    } else {
      console.log("no token");
    }
    return "";
  } catch (error: any) {
    console.log("Error while fetching token data");
    throw new Error(error.message);
  }
};
