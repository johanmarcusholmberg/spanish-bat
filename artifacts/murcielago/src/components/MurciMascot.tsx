import React from "react";
import murciImg from "@/assets/murci-mascot.png";
import { cn } from "@/lib/utils";

type MurciSize = "xs" | "sm" | "md" | "lg";
type MurciMood = "happy" | "thinking" | "encouraging" | "celebrating";

interface MurciMascotProps {
  size?: MurciSize;
  mood?: MurciMood;
  message?: string;
  className?: string;
  showBubble?: boolean;
}

const sizeMap: Record<MurciSize, string> = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
};

const MurciMascot: React.FC<MurciMascotProps> = ({
  size = "md",
  mood = "happy",
  message,
  className,
  showBubble = !!message,
}) => {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <img
        src={murciImg}
        alt="Murci"
        className={cn(
          sizeMap[size],
          "object-contain drop-shadow-md",
          mood === "celebrating" && "animate-bounce",
          mood === "happy" && "animate-float",
        )}
      />
      {showBubble && message && (
        <div className="relative bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground max-w-[240px] text-center shadow-soft">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-l border-t border-border rotate-45" />
          <span className="relative z-10">{message}</span>
        </div>
      )}
    </div>
  );
};

export default MurciMascot;
