import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Lock, Check, RefreshCw, ChevronDown, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTodayEcho, type TodayEchoFocus } from "@/hooks/useTodayEcho";
import { Button } from "@/components/ui/button";
import {
  EchoRingsMotif,
  MicPulseMotif,
  WaveformMotif,
  PhraseBubbleMotif,
  SentenceFlowMotif,
  PathDotsMotif,
} from "@/components/EchoMotifs";

const FOCUS_LABEL: Record<TodayEchoFocus, { en: string; sv: string }> = {
  pronunciation: { en: "Pronunciation", sv: "Uttal" },
  listening: { en: "Listening", sv: "Lyssna" },
  vocabulary: { en: "Vocabulary recall", sv: "Ordförråd" },
  sentences: { en: "Sentence building", sv: "Meningsbygge" },
  mixed_review: { en: "Mixed review", sv: "Blandad repetition" },
  weak_spots: { en: "Weak spots", sv: "Fokusområden" },
  due_review: { en: "Daily review", sv: "Daglig repetition" },
};

// Map each focus to its matching motif so the focus pill carries
// meaning instead of repeating the hero's echo-ring watermark.
const FOCUS_MOTIF: Record<TodayEchoFocus, React.FC<{ className?: string; tone?: "primary" | "clay" | "ink" }>> = {
  pronunciation: MicPulseMotif,
  listening: WaveformMotif,
  vocabulary: PhraseBubbleMotif,
  sentences: SentenceFlowMotif,
  mixed_review: PathDotsMotif,
  weak_spots: PathDotsMotif,
  due_review: PhraseBubbleMotif,
};

/**
 * Today's Echo — the daily session ritual at the top of the dashboard.
 * Pure renderer: every state-dependent string, CTA target, and progress
 * value comes from `useTodayEcho()`. Keep visual structure stable; do
 * not redesign the system here.
 */
const TodaysEchoHero: React.FC = () => {
  const { language, t } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();
  const plan = useTodayEcho();
  const [whyOpen, setWhyOpen] = useState(false);

  const focusLabel = FOCUS_LABEL[plan.focus][lang];
  const FocusMotif = FOCUS_MOTIF[plan.focus] ?? EchoRingsMotif;
  const completedDot =
    plan.state === "completed_today" || plan.state === "free_limit_reached";
  const isActive =
    plan.state === "not_started" ||
    plan.state === "no_data" ||
    plan.state === "in_progress";
  const isLoading = plan.state === "loading";
  const isError = plan.state === "error";

  const microcopy =
    lang === "sv"
      ? "Byggd från din nivå och senaste övning."
      : "Built from your level and recent practice.";

  const onPrimary = () => {
    if (isError) {
      plan.retry();
      return;
    }
    if (plan.primaryHref) navigate(plan.primaryHref);
  };

  const onSecondary = () => {
    if (plan.secondaryHref) navigate(plan.secondaryHref);
  };

  return (
    <section
      aria-labelledby="todays-echo-title"
      aria-busy={isLoading || undefined}
      className="relative overflow-hidden rounded-[1.4rem] border border-primary/20 gradient-ivory shadow-soft"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full hidden sm:block"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.16) 0%, hsl(var(--primary) / 0.05) 45%, transparent 72%)",
        }}
      />

      <div className="relative p-5 sm:p-7">
        {/* Eyebrow + title block */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="relative inline-flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-primary ${
                isActive ? "animate-ping opacity-75" : "opacity-0"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                completedDot
                  ? "bg-mint-dark"
                  : isError
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
            />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {t("todaysEchoEyebrow")}
          </p>
        </div>

        <h2
          id="todays-echo-title"
          className="font-heading font-bold text-[26px] sm:text-[32px] text-foreground leading-[1.1] tracking-tight"
        >
          {plan.title[lang]}
        </h2>
        <p className="text-[15px] sm:text-base text-foreground/75 mt-2 max-w-xl leading-relaxed">
          {plan.body[lang]}
        </p>

        {/* hairline divider — replaces the heavy bordered "card chrome" */}
        <div className="mt-5 mb-4 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

        {/* FOCUS ROW — the single, clear thing this session is about. */}
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 ring-1 ring-inset ring-primary/25">
            <FocusMotif className="h-5 w-5" tone="primary" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("todaysEchoFocus")}
            </p>
            <p className="font-heading font-semibold text-[15px] text-foreground leading-tight">
              {focusLabel}
            </p>
          </div>
        </div>

        {/* META ROW — level · time · session type, dot-separated, no icons. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
          {plan.level && (
            <>
              <span className="font-medium text-foreground/80">
                {t("todaysEchoLevel")} {plan.level}
              </span>
              <span aria-hidden className="opacity-50">·</span>
            </>
          )}
          <span>
            {plan.estimatedMinutes.min}–{plan.estimatedMinutes.max} {t("todaysEchoMin")}
          </span>
          <span aria-hidden className="opacity-50">·</span>
          <span>{plan.sessionType[lang]}</span>
        </div>

        {/* In-progress meter */}
        {plan.state === "in_progress" && plan.progress != null && (
          <div className="mt-4 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full gradient-peach transition-all"
                style={{ width: `${Math.round(plan.progress * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {plan.progressCurrent != null && plan.progressTotal != null
                ? lang === "sv"
                  ? `${plan.progressCurrent} av ${plan.progressTotal} (${Math.round(plan.progress * 100)}%)`
                  : `${plan.progressCurrent} of ${plan.progressTotal} (${Math.round(plan.progress * 100)}%)`
                : `${Math.round(plan.progress * 100)}%`}
            </p>
          </div>
        )}

        {/* Locked / completed callout */}
        {plan.lockedReason && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-900/15 dark:border-amber-700/50 p-3 text-sm text-amber-900 dark:text-amber-100">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p>{plan.lockedReason[lang]}</p>
              {plan.upgradeReason && (
                <p className="text-amber-800/90 dark:text-amber-200/90 text-[13px]">
                  {plan.upgradeReason[lang]}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Primary + Secondary CTAs */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Button
            size="lg"
            className="flex-1 h-12 text-base shadow-warm"
            disabled={isLoading || (!plan.primaryHref && !isError)}
            onClick={onPrimary}
          >
            {isError ? (
              <RefreshCw className="h-5 w-5 mr-2" />
            ) : completedDot ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <PlayCircle className="h-5 w-5 mr-2" />
            )}
            {plan.primaryActionLabel[lang]}
          </Button>
          {plan.secondaryActionLabel && plan.secondaryHref && (
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-12 text-base"
              onClick={onSecondary}
            >
              {plan.secondaryActionLabel[lang]}
            </Button>
          )}
        </div>

        {/* "Why this today?" — subtle, expandable explanation */}
        {!isLoading && (
          <div className="mt-4">
            <button
              type="button"
              aria-expanded={whyOpen}
              aria-controls="todays-echo-why"
              onClick={() => setWhyOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              <span>
                {lang === "sv" ? "Varför detta idag?" : "Why this today?"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${whyOpen ? "rotate-180" : ""}`}
              />
            </button>
            {whyOpen && (
              <p
                id="todays-echo-why"
                className="mt-2 text-[13px] text-foreground/75 leading-relaxed max-w-xl"
              >
                {plan.explanation[lang]}
              </p>
            )}
          </div>
        )}

        {/* Secondary microcopy — explains why this session was chosen. */}
        {!whyOpen && (
          <p className="mt-3 text-[12px] text-muted-foreground/85">
            {microcopy}
          </p>
        )}
      </div>
    </section>
  );
};

export default TodaysEchoHero;
