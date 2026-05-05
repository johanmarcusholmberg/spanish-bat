import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, X } from "lucide-react";
import {
  getPaywallCopy,
  type PaywallContext,
} from "@workspace/subscription";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface SoftPaywallProps {
  context: PaywallContext;
  /** Render inline (card) instead of a fixed bottom sheet. */
  variant?: "inline" | "sheet";
  /** Override the secondary CTA's onClick (e.g. "review basic flashcards"). */
  onSecondary?: () => void;
  /** Override the primary CTA's onClick. Defaults to /pricing. */
  onPrimary?: () => void;
  /** Optional dismiss handler — only shown for the sheet variant. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * Reusable, contextual Premium paywall.
 *
 * Pulls copy from the central `paywallCopy` map so the same context key
 * surfaces consistent language wherever it's used (web + mobile).
 *
 * Tone is warm and benefit-focused — primary CTA explains *what the
 * user gets*, secondary CTA always offers a clear free path so the
 * user is never trapped.
 */
const SoftPaywall: React.FC<SoftPaywallProps> = ({
  context,
  variant = "inline",
  onSecondary,
  onPrimary,
  onDismiss,
  className,
}) => {
  const { language } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();
  const copy = getPaywallCopy(context, lang);

  const handlePrimary = () => {
    if (onPrimary) onPrimary();
    else navigate("/pricing");
  };

  const card = (
    <div
      className={`relative rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-900/10 dark:border-amber-700/60 p-5 shadow-soft ${
        className ?? ""
      }`}
      role="region"
      aria-label={copy.title}
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={lang === "sv" ? "Stäng" : "Dismiss"}
          className="absolute top-3 right-3 text-amber-700/70 hover:text-amber-900 dark:text-amber-300/70 dark:hover:text-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          {context === "locked_mix" ||
          context === "library_locked" ||
          context === "advanced_insights" ? (
            <Lock className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          ) : (
            <Sparkles className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-base text-amber-950 dark:text-amber-100">
            {copy.title}
          </h3>
          <p className="text-sm text-amber-900/80 dark:text-amber-200/80 mt-1">
            {copy.body}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button size="sm" onClick={handlePrimary} className="flex-1">
              {copy.primaryCta}
            </Button>
            {onSecondary && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSecondary}
                className="flex-1"
              >
                {copy.secondaryCta}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "sheet") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        onClick={onDismiss}
      >
        <div
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {card}
        </div>
      </div>
    );
  }

  return card;
};

export default SoftPaywall;
