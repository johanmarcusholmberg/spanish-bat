import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, X, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  sessionStorageService,
  isResumable,
  type ActiveSessionState,
} from "@/lib/learningCoachStores";

/**
 * ResumePracticeCard
 * ------------------
 * Web mirror of the mobile "Continue today's practice" card. Reads the active
 * session envelope shared via `@workspace/learning-coach`'s session storage
 * (bound to localStorage on web), and offers a single CTA back into the
 * practice session screen. Hides itself when nothing is resumable so the
 * Today screen stays clean.
 */
const ResumePracticeCard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : "en";

  const [active, setActive] = useState<ActiveSessionState | null>(null);

  const refresh = useCallback(async () => {
    const state = await sessionStorageService.loadActiveSession();
    setActive(isResumable(state) ? state : null);
  }, []);

  useEffect(() => {
    void refresh();
    // Re-check on focus so navigating back from a session refreshes the card.
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  if (!active) return null;

  const stepLabel =
    lang === "sv"
      ? `Steg ${active.stepIndex + 1} av ${active.totalSteps}`
      : `Step ${active.stepIndex + 1} of ${active.totalSteps}`;
  const title =
    lang === "sv" ? "Fortsätt dagens övning" : "Continue today's practice";
  const subtitle =
    active.label ??
    (lang === "sv" ? "Du har en pågående övning." : "You have a session in progress.");
  const ctaLabel = lang === "sv" ? "Fortsätt" : "Resume";
  const dismissLabel = lang === "sv" ? "Avfärda" : "Dismiss";

  const progressPct = Math.min(
    100,
    Math.round(((active.stepIndex + 1) / Math.max(1, active.totalSteps)) * 100),
  );

  const onResume = () => {
    navigate(`/practice/session?mode=${encodeURIComponent(active.mode)}`);
  };

  const onDismiss = async () => {
    await sessionStorageService.clearCompletedSession();
    setActive(null);
  };

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <button
                type="button"
                onClick={onDismiss}
                aria-label={dismissLabel}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {subtitle}
            </p>
            <div className="mt-3 space-y-2">
              <Progress value={progressPct} className="h-2" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{stepLabel}</span>
                <Button size="sm" onClick={onResume} className="gap-1">
                  {ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumePracticeCard;
