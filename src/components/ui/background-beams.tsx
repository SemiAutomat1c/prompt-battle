import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = React.memo(() => {
  const beams = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      {beams.map((beam) => (
        <motion.div
          key={beam}
          className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"
          style={{
            left: `${(beam / beams.length) * 100 + 5}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scaleY: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + beam * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: beam * 0.2,
          }}
        />
      ))}
      
      {/* Horizontal beams for grid effect */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
          style={{
            top: `${(i / 4) * 100 + 20}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams";
