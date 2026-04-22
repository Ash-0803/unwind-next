import React, { useEffect } from "react";

interface LoadingAnimationProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = "Loading next round...",
  duration = 3000,
  onComplete,
}) => {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        {message && (
          <div className="text-muted-foreground animate-pulse">{message}</div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;
