"use client";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import { useEffect } from "react";
import Image from "next/image";
import Lenis from "@studio-freight/lenis";

const Page = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const lenis = new Lenis({ smooth: true });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    let svg = document.querySelector("svg");
    let path = svg?.querySelector("path");

    const pathLength = path?.getTotalLength();

    gsap.set(path, { strokeDasharray: pathLength });

    gsap.fromTo(
      path,
      { strokeDashoffset: pathLength },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#container",
          start: "top top",
          end: "bottom+=500 top",
          scrub: true,
        },
      }
    );

    gsap.to("#rect", {
      motionPath: {
        path: path,
        align: path,
      },
      ease: "none",
      scrollTrigger: {
        trigger: "#container",
        start: "top top",
        end: "bottom+=500 top",
        scrub: true,
      },
    });
  }, []);

  return (
    <div className=" h-[2800px] bg-white">
      <svg
        width="826"
        height="1911"
        viewBox="0 0 826 1911"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0"
      >
        <path
          id="path"
          d="M416 1C88 247.4 222.667 377 331 411C489.667 436 815.869 304.762 811 495C806.518 670.111 398 670 398 670C259 725.333 156.63 741.104 53 853C-124.673 1044.84 520.337 520.878 706 705C809.851 807.988 843.132 919.28 816 1063C768.544 1314.38 195.891 1082.42 221 1337C245.111 1581.47 739.756 1310.15 815 1544C907.889 1832.68 178.624 1924.72 46 1652C-0.90567 1555.55 -11.3982 1482.7 16 1379C89.5983 1100.45 655 1475 656 1746C657 2017 184 1870 184 1870"
          stroke="white"
          strokeWidth={10}
        />
      </svg>

      <div id="container" className="pt-[200vh] flex justify-center">
        <Image
          src="/assets/heart.gif"
          height={100}
          width={100}
          alt="heart"
          id="rect"
        />
      </div>
    </div>
  );
};

export default Page;
