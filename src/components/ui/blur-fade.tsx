import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
  yOffset?: number;
  xOffset?: number;
  blur?: string;
}

export const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className,
  variant = "up",
  duration = 0.5,
  delay = 0,
  yOffset = 6,
  xOffset = 0,
  blur = "6px",
}) => {
  const directionOffset = {
    up: { y: yOffset, x: 0 },
    down: { y: -yOffset, x: 0 },
    left: { y: 0, x: -xOffset || -yOffset },
    right: { y: 0, x: xOffset || yOffset },
  };

  const offset = directionOffset[variant];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: offset.y,
        x: offset.x,
        filter: `blur(${blur})`,
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

BlurFade.displayName = "BlurFade";
