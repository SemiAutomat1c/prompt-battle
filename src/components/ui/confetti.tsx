import React from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  particleCount?: number;
  spread?: number;
  colors?: string[];
  shapes?: ("circle" | "square" | "star")[];
}

export const triggerConfetti = ({
  particleCount = 50,
  spread = 70,
  colors = ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  shapes = ["star", "circle"],
}: ConfettiProps = {}) => {
  const defaults = {
    spread,
    ticks: 60,
    gravity: 0.8,
    decay: 0.96,
    startVelocity: 20,
    colors,
    shapes,
    scalar: 1.2,
  };

  const shoot = () => {
    confetti({
      ...defaults,
      particleCount,
      scalar: 1.2,
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(particleCount / 2),
      scalar: 0.75,
      shapes: ["circle"],
    });
  };

  shoot();
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

interface ConfettiButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

export const ConfettiButton: React.FC<ConfettiButtonProps> = ({
  children,
  onClick,
  className,
  ...confettiProps
}) => {
  const handleClick = () => {
    triggerConfetti(confettiProps);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

ConfettiButton.displayName = "ConfettiButton";
