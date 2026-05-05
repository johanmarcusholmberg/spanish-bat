import React from "react";
import { Eye, Headphones, Mic, Hammer, Sparkles, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Reusable visual representation of the "Echo pattern":
 *   See it → Hear it → Echo it → Build it → Use it
 *
 * Used as a header strip on Echo, Vocabulary, Sentence Builder, and the
 * Daily Review flow so the Echo identity ("Echo the language") is felt
 * across the product, not just on /learn/echo.
 *
 * Mobile-friendly: avoids hover, uses touch-sized chips, wraps cleanly on
 * narrow viewports.
 */

export type EchoStepKey = "see" | "hear" | "echo" | "build" | "use";

const ORDER: readonly EchoStepKey[] = ["see", "hear", "echo", "build", "use"];

const ICONS: Record<EchoStepKey, React.ElementType> = {
  see: Eye,
  hear: Headphones,
  echo: Mic,
  build: Hammer,
  use: Sparkles,
};

const LABEL_KEYS: Record<EchoStepKey, string> = {
  see: "echoStepSee",
  hear: "echoStepHear",
  echo: "echoStepEcho",
  build: "echoStepBuild",
  use: "echoStepUse",
};

interface Props {
  /** Currently active step. */
  active?: EchoStepKey;
  /** Steps that should render as already completed. */
  completed?: EchoStepKey[];
  /** Optional className for outer container. */
  className?: string;
  /** When true, render compact (icon + small label). */
  compact?: boolean;
}

const EchoSteps: React.FC<Props> = ({
  active,
  completed = [],
  className = "",
  compact = false,
}) => {
  const { language, t } = useLanguage();
  const lang = language === "sv" ? "sv" : "en";
  const done = new Set(completed);

  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 overflow-x-auto ${className}`}
      role="list"
      aria-label={lang === "sv" ? "Echo-steg" : "Echo steps"}
    >
      {ORDER.map((step, i) => {
        const Icon = ICONS[step];
        const isActive = step === active;
        const isDone = done.has(step);
        const base =
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap";
        const tone = isActive
          ? "bg-primary text-primary-foreground border-primary"
          : isDone
            ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
            : "bg-muted/40 text-muted-foreground border-border";
        return (
          <React.Fragment key={step}>
            <div role="listitem" className={`${base} ${tone}`}>
              {isDone ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {!compact && <span>{t(LABEL_KEYS[step])}</span>}
            </div>
            {i < ORDER.length - 1 && (
              <span
                aria-hidden
                className="text-muted-foreground/60 text-xs select-none"
              >
                ›
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default EchoSteps;
