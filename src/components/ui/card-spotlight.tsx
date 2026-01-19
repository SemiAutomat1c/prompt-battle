import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const CardSpotlight: React.FC<CardSpotlightProps> = ({
  children,
  className,
  spotlightColor = "rgba(59, 130, 246, 0.15)",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    mouseX.set(event.clientX - rect.left - centerX);
    mouseY.set(event.clientY - rect.top - centerY);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Spotlight effect */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${x}px ${y}px, ${spotlightColor}, transparent 40%)`,
            x,
            y,
          }}
        />
      )}
      
      {children}
    </div>
  );
};

CardSpotlight.displayName = "CardSpotlight";
