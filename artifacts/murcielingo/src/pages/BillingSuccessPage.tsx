import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { api } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const copy = {
  sv: {
    title: "Tack för din betalning!",
    desc: "Premium aktiveras inom några sekunder.",
    activating: "Aktiverar Premium...",
    activated: "Premium är aktiverat.",
    goDashboard: "Till dashboarden",
    goPricing: "Tillbaka till priser",
    failed:
      "Vi kunde inte bekräfta betalningen direkt. Du får ett mejl när allt är klart, eller försök ladda om sidan.",
  },
  en: {
    title: "Thanks for your purchase!",
    desc: "Premium will activate within a few seconds.",
    activating: "Activating Premium...",
    activated: "Premium is active.",
    goDashboard: "Go to dashboard",
    goPricing: "Back to pricing",
    failed:
      "We couldn't confirm the payment right away. You'll get an email when it lands, or try refreshing.",
  },
};

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 20000;

const BillingSuccessPage: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isPremium, refresh } = useSubscription();
  const [state, setState] = useState<"activating" | "active" | "timeout">(
    "activating",
  );

  // Drive the polling loop off the actual API response, not the closed-over
  // `isPremium` snapshot — otherwise the loop never sees the flip and runs
  // until timeout even on a successful purchase.
  useEffect(() => {
    const sessionId = params.get("session_id");
    if (sessionId) {
      api.stripe.getCheckoutSession(sessionId).catch(() => {});
    }

    const start = Date.now();
    let stop = false;
    const tick = async () => {
      if (stop) return;
      try {
        const sub = await api.subscription.get();
        if (stop) return;
        const premium = Boolean(
          (sub as { entitlements?: { isPremium?: boolean } } | null)
            ?.entitlements?.isPremium,
        );
        if (premium) {
          setState("active");
          await refresh();
          return;
        }
      } catch {
        // ignore transient errors, fall through to retry
      }
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        setState("timeout");
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    void tick();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPremium) setState("active");
  }, [isPremium]);

  return (
    <AppLayout>
      <div className="max-w-md mx-auto text-center py-16 px-4 animate-fade-in">
        <div className="mb-6 flex justify-center">
          {state === "activating" && (
            <Loader2 className="h-14 w-14 text-primary animate-spin" />
          )}
          {state === "active" && (
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          )}
          {state === "timeout" && (
            <Sparkles className="h-14 w-14 text-amber-500" />
          )}
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          {t.title}
        </h1>
        <p className="text-muted-foreground mb-6">
          {state === "activating"
            ? t.activating
            : state === "active"
              ? t.activated
              : t.failed}
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate("/dashboard")}>{t.goDashboard}</Button>
          <Button variant="outline" onClick={() => navigate("/pricing")}>
            {t.goPricing}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BillingSuccessPage;
