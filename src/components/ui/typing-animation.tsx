import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
  as?: React.ElementType;
  startDelay?: number;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  duration = 50,
  className,
  as: Component = "p",
  startDelay = 0,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, duration);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [text, duration, startDelay, onComplete]);

  return (
    <Component className={cn("whitespace-pre-wrap", className)}>
      {displayedText}
      {!isComplete && (
        <span className="animate-blink ml-0.5 inline-block h-4 w-0.5 bg-current" />
      )}
    </Component>
  );
};

TypingAnimation.displayName = "TypingAnimation";
