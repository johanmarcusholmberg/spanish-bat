import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  label?: string;
  size?: "sm" | "md";
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  className,
  label = "Premium",
  size = "sm",
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      className,
    )}
  >
    <Sparkles className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
    {label}
  </span>
);

export default PremiumBadge;
