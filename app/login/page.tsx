"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

const Page = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      console.log("Logged in successfully!");

      router.push("/search");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#200119] to-[#22010d] h-screen w-full flex flex-col">
      <button
        onClick={() => router.push("/")}
        className="absolute px-6 pt-10 flex justify-center items-center gap-2 text-sm cursor-pointer"
      >
        <ArrowLeft color="white" />
        <span className="text-white font-medium">Back to Home</span>
      </button>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center">
            <h1 className="text-white text-xl font-medium mt-2">Welcome to</h1>
            <h2 className="text-pink-600/90 text-4xl ml-2 heading">Blindly</h2>
          </div>

          <p className="text-secondary-foreground font-semibold text-center max-w-md text-white/80">
            Sign in below to start using the app.
          </p>

          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center gap-4 w-full"
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-2 rounded-md w-72 bg-white text-black focus:outline-none"
            />
            <input
              type="text"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-2 rounded-md w-72 bg-white text-black focus:outline-none"
            />
            \
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center text-white font-semibold py-3 px-9 bg-gradient-to-b from-pink-800/40 via-pink-800/60 to-pink-800/40 hover:bg-pink-900 transition cursor-pointer rounded-lg border border-pink-900/5 border-l-pink-900 border-r-pink-900 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
