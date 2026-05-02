import React, { useEffect, useState, useRef } from "react";
import { Typography } from "@/components/Typography";

interface AnimatedScoreProps {
  value: number;
  durationMs?: number;
}

/**
 * Animated count-up of a percentage score, displayed as `<value>%`.
 * Uses requestAnimationFrame for smooth animation that respects the device clock.
 */
export function AnimatedScore({ value, durationMs = 700 }: AnimatedScoreProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const start = Date.now();
    const target = Math.max(0, Math.min(100, Math.round(safeValue)));
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(target * eased);
      setDisplayed(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayed(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return (
    <Typography variant="h1" center>
      {displayed}%
    </Typography>
  );
}
