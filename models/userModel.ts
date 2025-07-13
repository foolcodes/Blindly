import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: [true, "This username is already taken"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please provide your gender"],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;
