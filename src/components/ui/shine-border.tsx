import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
}

export const ShineBorder: React.FC<ShineBorderProps> = ({
  borderRadius = 8,
  borderWidth = 2,
  duration = 3,
  color = ["#3b82f6", "#8b5cf6", "#ec4899"],
  className,
  children,
}) => {
  const colors = Array.isArray(color) ? color : [color];
  
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg", className)}
      style={
        {
          borderRadius: `${borderRadius}px`,
        } as React.CSSProperties
      }
    >
      {/* Animated shine border */}
      <motion.div
        className="pointer-events-none absolute -inset-0.5 rounded-lg opacity-75 blur-sm"
        style={{
          background: `conic-gradient(from 0deg, ${colors.join(", ")}, ${
            colors[0]
          })`,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Content container */}
      <div
        className="relative z-10 h-full w-full rounded-lg bg-slate-900"
        style={{
          borderRadius: `${borderRadius - 1}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

ShineBorder.displayName = "ShineBorder";
