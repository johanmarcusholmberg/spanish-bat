import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  friendlySubskillName,
  type PracticeMode,
  type WeakSpot,
} from "@workspace/practice";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  mode: PracticeMode;
  weakSpots: WeakSpot[];
  dueCount: number;
  hasHistory: boolean;
  /** Optional adaptive reason already produced by the recommender. */
  recommenderReason?: { en: string; sv: string };
  className?: string;
}

/**
 * "Why this practice?" — a small, warm explanation users can open to
 * see why Murci picked this session. Falls back to safe, human copy
 * when there is little or no adaptive signal yet.
 *
 * Intentionally avoids exposing scores, item ids, or algorithm jargon.
 */
const WhyThisPractice: React.FC<Props> = ({
  mode,
  weakSpots,
  dueCount,
  hasHistory,
  recommenderReason,
  className = "",
}) => {
  const { language } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const [open, setOpen] = useState(false);

  const bullets = useMemo<string[]>(() => {
    const out: string[] = [];
    if (recommenderReason) out.push(recommenderReason[lang]);

    if (!hasHistory) {
      out.push(
        lang === "sv"
          ? "Den här sessionen hjälper Murciélingo att lära sig din nuvarande nivå."
          : "This session helps Murciélingo learn your current level.",
      );
      out.push(
        lang === "sv"
          ? "Vi blandar lyssnande, återkallning och eko-övning så vanan blir starkare."
          : "We mix listening, recall, and echo practice to build a stronger habit.",
      );
      return out;
    }

    if (dueCount > 0) {
      out.push(
        lang === "sv"
          ? `${dueCount} fraser är redo att eka tillbaka idag.`
          : `${dueCount} phrases are ready to echo back today.`,
      );
    }

    const top = weakSpots.slice(0, 2).map((w) => friendlySubskillName(w.subskill, lang));
    if (top.length > 0) {
      out.push(
        lang === "sv"
          ? `Vi tar upp fraser från ${top.join(" och ")} som du tvekade på senast.`
          : `We're bringing back phrases from ${top.join(" and ")} you hesitated on.`,
      );
    }

    if (mode === "weak_spots") {
      out.push(
        lang === "sv"
          ? "Korta repetitioner i lite olika former så det fastnar lättare."
          : "Short repetitions in slightly different ways so it sticks more easily.",
      );
    } else if (mode === "due_review") {
      out.push(
        lang === "sv"
          ? "Murci tar tillbaka fraser precis när minnet behöver dem."
          : "Murci brings phrases back right when memory needs them.",
      );
    } else if (mode === "challenge") {
      out.push(
        lang === "sv"
          ? "En liten utmaning för att sträcka det du redan kan."
          : "A gentle stretch to push what you already know.",
      );
    } else {
      out.push(
        lang === "sv"
          ? "En kort talrunda ingår om mikrofonen är på."
          : "A short speaking round is included if your mic is on.",
      );
    }

    return out;
  }, [dueCount, hasHistory, lang, mode, recommenderReason, weakSpots]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
      >
        <Sparkles className="h-3 w-3" />
        {lang === "sv" ? "Varför den här övningen?" : "Why this practice?"}
        {open ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-background/60 border border-border/60 p-3">
          <ul className="space-y-1.5 text-xs text-foreground/80 leading-relaxed">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden className="text-primary mt-0.5">·</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WhyThisPractice;
