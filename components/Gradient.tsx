import { useEffect, useRef } from "react";

import { Gradient } from "./Gradient.js";

const GradientBackground = () => {
  const canvasRef = useRef(null);
  const gradientRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      gradientRef.current = new Gradient();
      gradientRef.current.el = canvasRef.current;
      gradientRef.current.connect();
    }

    return () => {
      if (gradientRef.current) {
        gradientRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen inverted-radius-left">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 -z-1 w-full h-full inverted-radius"
      />
    </div>
  );
};

export default GradientBackground;
