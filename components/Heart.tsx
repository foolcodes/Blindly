import Image from "next/image";
import React from "react";

const Heart = () => {
  return (
    <Image
      height={100}
      width={100}
      src="/assets/heart.gif"
      alt="heart"
      className="z-50 absolute top-50 left-50"
    />
  );
};

export default Heart;
