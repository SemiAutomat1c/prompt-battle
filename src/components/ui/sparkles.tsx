import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesProps {
  className?: string;
  size?: number;
  color?: string;
  count?: number;
}

export const Sparkles: React.FC<SparklesProps> = ({
  className,
  size = 2,
  color = "#FFC700",
  count = 15,
}) => {
  const sparkles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1,
      size: size + Math.random() * size,
    }));
  }, [count, size]);

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: color,
            boxShadow: `0 0 ${sparkle.size * 2}px ${color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

Sparkles.displayName = "Sparkles";
