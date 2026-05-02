import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface EntitlementErrorProps {
  /** What broke. Pass the message from `useSubscription().error` or similar. */
  message?: string | null;
  /** Retry handler — usually `refresh()` from `useSubscription`. */
  onRetry?: () => void | Promise<void>;
  /**
   * Why this is showing. Pick the closest match so the copy matches the
   * actual failure mode the user is seeing.
   */
  variant?:
    | "entitlement-load"
    | "stripe-unavailable"
    | "revenuecat-unavailable"
    | "missing-env";
  className?: string;
}

const COPY = {
  sv: {
    titleEntitlement: "Kunde inte ladda ditt abonnemang",
    descEntitlement:
      "Vi kunde inte hämta din premium-status just nu. Du kan fortsätta använda gratisfunktionerna.",
    titleStripe: "Betalningstjänsten är inte tillgänglig",
    descStripe:
      "Stripe svarar inte just nu. Försök igen om en stund eller kontakta support om problemet kvarstår.",
    titleRC: "Köp i appen är inte tillgängliga",
    descRC:
      "App Store / Play Store-tjänsten svarar inte just nu. Du kan fortfarande använda gratisfunktionerna.",
    titleMissing: "Abonnemang inte aktiverat",
    descMissing:
      "Abonnemang är inte konfigurerat i denna miljö. Kontakta administratören om du försöker uppgradera.",
    retry: "Försök igen",
  },
  en: {
    titleEntitlement: "Couldn't load your subscription",
    descEntitlement:
      "We couldn't fetch your premium status right now. You can still use the free features.",
    titleStripe: "Payments service unavailable",
    descStripe:
      "Stripe is not responding right now. Please try again in a moment, or contact support if it keeps happening.",
    titleRC: "In-app purchases unavailable",
    descRC:
      "The App Store / Play Store service isn't responding right now. You can still use the free features.",
    titleMissing: "Subscriptions not enabled",
    descMissing:
      "Subscriptions aren't configured in this environment. Contact the admin if you're trying to upgrade.",
    retry: "Try again",
  },
} as const;

const EntitlementError: React.FC<EntitlementErrorProps> = ({
  message,
  onRetry,
  variant = "entitlement-load",
  className,
}) => {
  const { language } = useLanguage();
  const t = COPY[language];

  const { title, desc } =
    variant === "stripe-unavailable"
      ? { title: t.titleStripe, desc: t.descStripe }
      : variant === "revenuecat-unavailable"
        ? { title: t.titleRC, desc: t.descRC }
        : variant === "missing-env"
          ? { title: t.titleMissing, desc: t.descMissing }
          : { title: t.titleEntitlement, desc: t.descEntitlement };

  return (
    <div
      role="alert"
      className={`rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700 p-4 ${
        className ?? ""
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            {title}
          </p>
          <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
            {desc}
          </p>
          {message && (
            <p className="text-xs font-mono text-amber-700/70 dark:text-amber-300/70 mt-2 break-all">
              {message}
            </p>
          )}
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => void onRetry()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {t.retry}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntitlementError;
