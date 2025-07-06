"use client";

import GradientBackground from "@/components/Gradient";
import Heart from "@/components/Heart";

import Hero from "@/components/LandingPage/Hero";
const page = () => {
  return (
    <div className=" h-full w-screen overflow-hidden relative">
      <div className="fixed top-0 left-0 w-full h-screen">
        <GradientBackground />
      </div>
      <Hero />

      <Heart />
    </div>
  );
};

export default page;
