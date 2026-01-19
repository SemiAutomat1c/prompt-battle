import React from "react";
import { cn } from "@/lib/utils";

interface RetroGridProps {
  className?: string;
  angle?: number;
}

export const RetroGrid: React.FC<RetroGridProps> = ({
  className,
  angle = 65,
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-50 [perspective:200px]",
        className
      )}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      {/* Grid */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "animate-grid",
            "[background-image:linear-gradient(to_right,rgba(59,130,246,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(59,130,246,0.3)_1px,transparent_0)]",
            "[background-size:60px_60px]",
            "[height:300vh]",
            "[inset:0%_0px]",
            "[margin-left:-50%]",
            "[transform-origin:100%_0_0]",
            "[width:600vw]"
          )}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
    </div>
  );
};

RetroGrid.displayName = "RetroGrid";
