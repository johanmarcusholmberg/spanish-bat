import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lock, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEchoMemory } from "@/hooks/useEchoMemory";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Button } from "@/components/ui/button";

/**
 * Echo Memory — a small, friendly card that shows what Murciélingo is
 * remembering for the user. Free users see a one-line preview and an
 * upgrade hook; paid users see active items they can practice.
 *
 * Deliberately *not* an analytics dashboard. No raw scores or ids.
 */
const EchoMemoryPreview: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { language } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();
  const { isPremium, loading } = useFeatureAccess();
  const memory = useEchoMemory();

  if (loading) return null;

  const tagline =
    lang === "sv"
      ? "Murciélingo kommer ihåg fraserna du behöver repetera."
      : "Murciélingo remembers the phrases you need to repeat.";

  const detail = (() => {
    if (!memory.hasData) {
      return lang === "sv"
        ? "Gör en kort övning så börjar Murci minnas vad du behöver eka tillbaka."
        : "Do a short practice and Murci will start remembering what you need to echo back.";
    }
    const lines: string[] = [];
    if (memory.dueCount > 0) {
      lines.push(
        lang === "sv"
          ? `${memory.dueCount} fraser är redo att repetera.`
          : `${memory.dueCount} phrases are ready to review.`,
      );
    } else if (memory.weakCount > 0) {
      lines.push(
        lang === "sv"
          ? `${memory.weakCount} fraser väntar på en till runda.`
          : `${memory.weakCount} phrases are waiting for another round.`,
      );
    }
    if (memory.topImproved) {
      lines.push(
        lang === "sv"
          ? `Du blir starkare på ${memory.topImproved.sv}.`
          : `You're getting stronger on ${memory.topImproved.en}.`,
      );
    } else if (memory.topFocus) {
      lines.push(
        lang === "sv"
          ? `Fokus just nu: ${memory.topFocus.sv}.`
          : `Current focus: ${memory.topFocus.en}.`,
      );
    }
    if (lines.length === 0) {
      lines.push(
        lang === "sv"
          ? "Inget ligger på kö just nu — fortsätt så fyller vi minnet."
          : "Nothing queued right now — keep practicing and the memory will fill in.",
      );
    }
    return lines.join(" ");
  })();

  return (
    <div
      className={`bg-card rounded-2xl p-5 shadow-soft border border-border ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-base">
              {lang === "sv" ? "Eko-minne" : "Echo Memory"}
            </h3>
            {!isPremium && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" />
                {lang === "sv" ? "Förhandsvisning" : "Preview"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
          <p className="text-sm text-foreground/85 mt-2 leading-relaxed">
            {detail}
          </p>

          {!isPremium ? (
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="gap-1"
              >
                <Lock className="h-3.5 w-3.5" />
                {lang === "sv"
                  ? "Lås upp hela Eko-minnet"
                  : "Unlock full Echo Memory"}
              </Button>
              <span className="text-[11px] text-muted-foreground">
                {lang === "sv"
                  ? "så Murci kan anpassa sessionerna åt dig."
                  : "so Murci can keep adapting your sessions."}
              </span>
            </div>
          ) : (
            memory.dueCount > 0 && (
              <Button
                size="sm"
                className="mt-3"
                onClick={() => navigate("/practice/session?mode=due_review")}
              >
                {lang === "sv" ? "Repetera nu" : "Review now"}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EchoMemoryPreview;
