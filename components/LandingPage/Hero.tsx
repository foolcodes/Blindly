"use client";

import Image from "next/image";
import Logo from "./Logo";
import Menu from "./Menu";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Navbar */}

      <Logo />
      <Menu />

      {/* Main content */}
      <div className="container mx-auto px-4 text-center relative z-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 heading animate-fade-in">
            Talk before you see.
          </h1>

          <h1 className="block text-pink-300 text-4xl heading mb-10">
            Connect beyond looks.
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-12 animate-fade-in opacity-90">
            Anonymous voice chats with fun mini-games. Discover real connections
            in 3-4 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
            <button className="bg-white text-black font-semibold px-8 py-3 rounded-2xl flex justify-center items-center">
              <Image
                src="/yin-yang.png"
                alt=""
                height={5}
                width={25}
                className="mr-2"
              />
              Get started
            </button>
            <button className="bg-pink-800 text-white rounded-2xl px-8 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
