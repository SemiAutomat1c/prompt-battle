import React, { useEffect, useRef } from "react";
import { useMotionValue, useSpring, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const [displayValue, setDisplayValue] = React.useState(
    direction === "down" ? value : 0
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      motionValue.set(value);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [motionValue, delay, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [springValue]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {displayValue.toFixed(decimalPlaces)}
    </motion.span>
  );
};

NumberTicker.displayName = "NumberTicker";
