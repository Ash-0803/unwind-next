"use client";

import PixelSnow from './PixelSnow';

interface SnowBackgroundProps {
  className?: string;
}

export default function SnowBackground({ className = '' }: SnowBackgroundProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <PixelSnow 
        color="#ffffff"
        flakeSize={0.01}
        minFlakeSize={1.25}
        pixelResolution={200}
        speed={1.25}
        density={0.3}
        direction={125}
        brightness={1}
        depthFade={8}
        farPlane={20}
        gamma={0.4545}
        variant="square"
      />
    </div>
  );
}
