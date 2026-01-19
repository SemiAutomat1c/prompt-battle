import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
  fromRef?: React.RefObject<HTMLElement>;
  toRef?: React.RefObject<HTMLElement>;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  duration = 2,
  delay = 0,
  pathColor = "rgba(59, 130, 246, 0.2)",
  pathWidth = 2,
  gradientStartColor = "#3b82f6",
  gradientStopColor = "#8b5cf6",
}) => {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Static path */}
      <motion.path
        d="M 0 50% L 100% 50%"
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
      
      {/* Animated beam */}
      <motion.rect
        width="60"
        height={pathWidth + 4}
        y={`calc(50% - ${(pathWidth + 4) / 2}px)`}
        rx="2"
        fill="url(#beam-gradient)"
        initial={{ x: "-60px" }}
        animate={{ x: "calc(100% + 60px)" }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </svg>
  );
};

// Simple beam connector for VS badge
interface BeamConnectorProps {
  className?: string;
  direction?: "left" | "right";
}

export const BeamConnector: React.FC<BeamConnectorProps> = ({
  className,
  direction = "left",
}) => {
  const gradientId = `beam-${direction}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={cn("relative h-1 w-full overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <motion.div
        className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"
        initial={{ x: direction === "left" ? "-100%" : "100%" }}
        animate={{ x: direction === "left" ? "200%" : "-200%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.5,
        }}
      />
    </div>
  );
};

AnimatedBeam.displayName = "AnimatedBeam";
BeamConnector.displayName = "BeamConnector";
