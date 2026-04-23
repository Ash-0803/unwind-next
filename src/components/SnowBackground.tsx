"use client";

import PixelSnow from "./PixelSnow";

interface SnowBackgroundProps {
  className?: string;
}

export default function SnowBackground({
  className = "",
}: SnowBackgroundProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <PixelSnow
        color="#ffffff"
        flakeSize={0.007}
        minFlakeSize={1.25}
        pixelResolution={200}
        speed={1.25}
        density={0.25}
        direction={125}
        brightness={1}
        depthFade={6.5}
        farPlane={12}
        gamma={0.4545}
        variant="round"
      />
    </div>
  );
}
