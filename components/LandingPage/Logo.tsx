"use client";

import Image from "next/image";

const Navbar = () => {
  return (
    <Image
      src="/assets/logo.png"
      alt="Blindly logo"
      height={110}
      width={110}
      className="absolute -top-1 left-1"
    />
  );
};

export default Navbar;
