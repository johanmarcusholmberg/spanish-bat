import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, PlayCircle, Sparkles, Lock, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTodayEcho, type TodayEchoFocus } from "@/hooks/useTodayEcho";
import { Button } from "@/components/ui/button";

const FOCUS_LABEL: Record<TodayEchoFocus, { en: string; sv: string }> = {
  pronunciation: { en: "Pronunciation", sv: "Uttal" },
  listening: { en: "Listening", sv: "Lyssna" },
  vocabulary: { en: "Vocabulary recall", sv: "Ordförråd" },
  sentences: { en: "Sentence building", sv: "Meningsbygge" },
  mixed_review: { en: "Mixed review", sv: "Blandad repetition" },
  weak_spots: { en: "Weak spots", sv: "Fokusområden" },
  due_review: { en: "Daily review", sv: "Daglig repetition" },
};

/**
 * EchoRings — small Murciélingo visual motif used as the hero icon.
 * Concentric arcs that read as both a sound wave and a microphone
 * pulse. Pure SVG so it scales cleanly on mobile.
 */
const EchoRings: React.FC<{ active?: boolean }> = ({ active = false }) => (
  <svg
    viewBox="0 0 64 64"
    className={`h-12 w-12 sm:h-14 sm:w-14 ${active ? "animate-pulse" : ""}`}
    aria-hidden
  >
    <defs>
      <linearGradient id="echo-rings-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="6" fill="url(#echo-rings-grad)" />
    <circle
      cx="32"
      cy="32"
      r="14"
      fill="none"
      stroke="hsl(var(--primary) / 0.55)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="44 14"
    />
    <circle
      cx="32"
      cy="32"
      r="22"
      fill="none"
      stroke="hsl(var(--primary) / 0.35)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="34 24"
    />
    <circle
      cx="32"
      cy="32"
      r="29"
      fill="none"
      stroke="hsl(var(--primary) / 0.18)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="22 30"
    />
  </svg>
);

const TodaysEchoHero: React.FC = () => {
  const { language, t } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();
  const plan = useTodayEcho();

  const focusLabel = FOCUS_LABEL[plan.focus][lang];
  const completedDot =
    plan.state === "completed_today" || plan.state === "free_limit_reached";

  return (
    <section
      aria-labelledby="todays-echo-title"
      className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-peach-light/40 via-card to-card p-5 sm:p-7 shadow-soft"
    >
      {/* Soft echo-ring backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-primary/5 blur-2xl"
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <EchoRings active={plan.state === "not_started" || plan.state === "no_data"} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              {t("todaysEchoEyebrow")}
            </p>
            <h2
              id="todays-echo-title"
              className="font-heading font-bold text-2xl sm:text-3xl text-foreground leading-tight mt-0.5"
            >
              {plan.title[lang]}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
              {plan.body[lang]}
            </p>
          </div>
        </div>

        {/* Meta row: focus · level · time */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            {t("todaysEchoFocus")}: {focusLabel}
          </span>
          {plan.level && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-foreground/80 px-3 py-1 font-medium">
              {t("todaysEchoLevel")} · {plan.level}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-3 py-1">
            <Clock className="h-3.5 w-3.5" />
            {plan.estimatedMinutes.min}–{plan.estimatedMinutes.max} {t("todaysEchoMin")}
          </span>
        </div>

        {/* In-progress meter */}
        {plan.state === "in_progress" && plan.progress != null && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round(plan.progress * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {Math.round(plan.progress * 100)}%
            </p>
          </div>
        )}

        {/* Locked / completed callout */}
        {plan.lockedReason && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-900/15 dark:border-amber-700/50 p-3 text-sm text-amber-900 dark:text-amber-100">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{plan.lockedReason[lang]}</span>
          </div>
        )}

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            size="lg"
            className="flex-1 h-12 text-base"
            disabled={!plan.primaryHref}
            onClick={() => plan.primaryHref && navigate(plan.primaryHref)}
          >
            {completedDot ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <PlayCircle className="h-5 w-5 mr-2" />
            )}
            {plan.primaryActionLabel[lang]}
          </Button>
          {plan.state === "free_limit_reached" && (
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-12 text-base"
              onClick={() => navigate("/practice/flashcards")}
            >
              {lang === "sv" ? "Repetera sparade ord" : "Review saved words"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TodaysEchoHero;
