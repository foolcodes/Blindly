import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function connectDb(): Promise<void> {
  if (connection.isConnected) {
    console.log("DB already connected");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI || "");

    connection.isConnected = db.connections[0].readyState;

    console.log("DB connected successfully");
  } catch (error) {
    console.log("Error connecting to DB", error);
    process.exit(1);
  }
}

export default connectDb;
