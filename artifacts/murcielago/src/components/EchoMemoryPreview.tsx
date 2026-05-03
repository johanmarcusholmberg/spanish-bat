import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lock, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEchoMemory } from "@/hooks/useEchoMemory";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Button } from "@/components/ui/button";

/**
 * Echo Memory — a small, friendly card that shows what Murciélingo is
 * remembering for the user.
 *
 * Polish goals:
 *   - Make the value tangible: a tiny stat strip (Tracked / Improving /
 *     Due) so the user sees concrete numbers instead of just prose.
 *   - Always offer a next step: even when nothing is "due", surface a
 *     focus-area or quick-session CTA so the card is never inert.
 *   - Free-tier teaser stays warm: a one-line preview that *quotes* the
 *     real tracked count so the upgrade hook feels earned, not generic.
 *
 * Deliberately *not* an analytics dashboard — no raw scores or ids.
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

  // ── Detail line ─────────────────────────────────────────────────────
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

  // ── Smart primary action ────────────────────────────────────────────
  // The card always offers a next step when there's data, so it never
  // looks "stuck". Premium users go straight into the right session
  // mode; free users get the upgrade hook with a contextual sub-line.
  const primary = (() => {
    if (!memory.hasData) {
      return {
        label: lang === "sv" ? "Starta en 2-min session" : "Start a 2-min session",
        onClick: () => navigate("/practice"),
      };
    }
    if (memory.dueCount > 0) {
      return {
        label:
          lang === "sv"
            ? `Repetera ${memory.dueCount} nu`
            : `Review ${memory.dueCount} now`,
        onClick: () => navigate("/practice/session?mode=due_review"),
      };
    }
    if (memory.weakCount > 0 || memory.topFocus) {
      return {
        label:
          lang === "sv" ? "Öva fokusområden" : "Practice focus areas",
        onClick: () => navigate("/practice/session?mode=weak_spots"),
      };
    }
    return {
      label: lang === "sv" ? "Snabb session" : "Quick session",
      onClick: () => navigate("/practice/session?mode=quick"),
    };
  })();

  // ── Stat strip ──────────────────────────────────────────────────────
  // Hidden in the empty state (no signal yet), shown otherwise to make
  // "what does Murci know about me?" visible at a glance.
  const stats = memory.hasData
    ? [
        {
          label: lang === "sv" ? "Spårade" : "Tracked",
          value: memory.trackedCount,
          tone: "default" as const,
        },
        {
          label: lang === "sv" ? "Stärks" : "Improving",
          value: memory.improvedCount,
          tone: "good" as const,
        },
        {
          label: lang === "sv" ? "Att repetera" : "Due",
          value: memory.dueCount,
          tone: "warn" as const,
        },
      ]
    : [];

  return (
    <div
      className={`bg-card rounded-2xl p-5 shadow-soft border border-border ${className}`}
      data-testid="echo-memory-preview"
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

          {stats.length > 0 && (
            <div
              className="flex flex-wrap gap-1.5 mt-3"
              role="list"
              aria-label={lang === "sv" ? "Statistik" : "Stats"}
            >
              {stats.map((s) => (
                <span
                  key={s.label}
                  role="listitem"
                  className={`inline-flex items-baseline gap-1 px-2 py-0.5 rounded-md text-xs ${
                    s.tone === "good"
                      ? "bg-mint/30 text-mint-dark dark:text-mint"
                      : s.tone === "warn"
                        ? s.value > 0
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                          : "bg-muted text-muted-foreground"
                        : "bg-muted text-foreground/80"
                  }`}
                >
                  <span className="font-semibold tabular-nums">{s.value}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    {s.label}
                  </span>
                </span>
              ))}
            </div>
          )}

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
                {memory.hasData
                  ? lang === "sv"
                    ? `Murci spårar redan ${memory.trackedCount} ord åt dig.`
                    : `Murci is already tracking ${memory.trackedCount} items for you.`
                  : lang === "sv"
                    ? "så Murci kan anpassa sessionerna åt dig."
                    : "so Murci can keep adapting your sessions."}
              </span>
            </div>
          ) : (
            <Button size="sm" className="mt-3" onClick={primary.onClick}>
              {primary.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EchoMemoryPreview;
