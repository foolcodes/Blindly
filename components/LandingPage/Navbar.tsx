"use client";

import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="flex items-center">
      <Image src="/logos.png" alt="Blindly logo" height={140} width={140} />
      <h1 className="text-white text-2xl font-semibold">Blindly</h1>
    </nav>
  );
};

export default Navbar;
