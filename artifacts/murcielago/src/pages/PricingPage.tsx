import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { api } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import Footer from "@/components/Footer";
import PremiumBadge from "@/components/PremiumBadge";
import EntitlementError from "@/components/EntitlementError";
import SubscriptionDebugPanel from "@/components/SubscriptionDebugPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Interval = "monthly" | "yearly";

interface StripeConfig {
  enabled: boolean;
  publishableKey: string | null;
  prices: { monthly: string | null; yearly: string | null };
}

const copy = {
  sv: {
    back: "Tillbaka",
    title: "Priser",
    subtitle: "Välj en plan som passar din språkresa.",
    free: "Gratis",
    premium: "Premium",
    monthly: "Månadsvis",
    yearly: "Årsvis",
    yearSave: "Spara med årsabonnemang",
    currentPlan: "Din nuvarande plan",
    upgrade: "Uppgradera",
    manage: "Hantera abonnemang",
    signIn: "Logga in för att uppgradera",
    loading: "Laddar...",
    notConfigured:
      "Stripe är inte aktiverat ännu. När administratören har lagt in nycklarna kommer knapparna nedan att fungera.",
    freeFeatures: [
      "Alla grundövningar",
      "Begränsad ordbok",
      "Grammatik (utvalda lektioner)",
      "Läsförståelse (utvalda texter)",
      "Streak och grundläggande statistik",
    ],
    premiumFeatures: [
      "Obegränsade lektioner och övningar",
      "Hela grammatikbiblioteket",
      "Alla läsförståelsetexter",
      "Repetitionsläge (review mode)",
      "Avancerad statistik och framstegsanalys",
      "Prioriterad support",
    ],
    failedToStart: "Kunde inte starta betalningen. Försök igen.",
  },
  en: {
    back: "Back",
    title: "Pricing",
    subtitle: "Pick the plan that fits your language journey.",
    free: "Free",
    premium: "Premium",
    monthly: "Monthly",
    yearly: "Yearly",
    yearSave: "Save with yearly billing",
    currentPlan: "Your current plan",
    upgrade: "Upgrade",
    manage: "Manage subscription",
    signIn: "Sign in to upgrade",
    loading: "Loading...",
    notConfigured:
      "Stripe is not enabled yet. Once the admin adds the keys, the buttons below will work.",
    freeFeatures: [
      "All core exercises",
      "Limited vocabulary",
      "Grammar (selected lessons)",
      "Reading (selected passages)",
      "Streak + basic stats",
    ],
    premiumFeatures: [
      "Unlimited lessons & exercises",
      "Full grammar library",
      "All reading passages",
      "Review mode",
      "Advanced stats & progress analysis",
      "Priority support",
    ],
    failedToStart: "Couldn't start checkout. Please try again.",
  },
};

const PricingPage: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { isPremium, loading: subLoading, refresh, error: subError } =
    useSubscription();
  const { toast } = useToast();

  const [interval, setInterval] = useState<Interval>("monthly");
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.stripe
      .config()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        if (!cancelled) setConfig({ enabled: false, publishableKey: null, prices: { monthly: null, yearly: null } });
      })
      .finally(() => {
        if (!cancelled) setConfigLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // If we just came back from a successful checkout, refresh entitlements.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("refresh") === "1") {
      void refresh();
    }
  }, [refresh]);

  const startCheckout = async () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (!config?.enabled) return;
    setSubmitting(true);
    try {
      const { url } = await api.stripe.checkout(interval, user?.email);
      window.location.href = url;
    } catch (err) {
      toast({
        title: t.failedToStart,
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openPortal = async () => {
    setSubmitting(true);
    try {
      const { url } = await api.stripe.portal();
      window.location.href = url;
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stripeReady =
    !!config?.enabled &&
    !!(interval === "monthly" ? config.prices.monthly : config.prices.yearly);

  const body = (
    <div className="animate-fade-in max-w-4xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full bg-muted p-1">
          {(["monthly", "yearly"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setInterval(opt)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                interval === opt
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt === "monthly" ? t.monthly : t.yearly}
            </button>
          ))}
        </div>
      </div>
      {interval === "yearly" && (
        <p className="text-center text-sm text-emerald-700 dark:text-emerald-400 mb-6">
          {t.yearSave}
        </p>
      )}

      {subError && isLoggedIn && (
        <div className="mb-4">
          <EntitlementError
            variant="entitlement-load"
            message={subError}
            onRetry={refresh}
          />
        </div>
      )}

      {!configLoading && config && !config.enabled && (
        <div className="mb-6">
          <EntitlementError variant="missing-env" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <PlanCard
          title={t.free}
          highlighted={!isPremium}
          isCurrent={!isPremium && isLoggedIn}
          features={t.freeFeatures}
          actionLabel={isPremium ? "" : t.currentPlan}
          actionDisabled
        />

        <PlanCard
          title={t.premium}
          badge={<PremiumBadge size="md" />}
          highlighted={isPremium}
          isCurrent={isPremium}
          features={t.premiumFeatures}
          actionLabel={
            !isLoggedIn
              ? t.signIn
              : isPremium
                ? t.manage
                : configLoading || subLoading
                  ? t.loading
                  : t.upgrade
          }
          actionDisabled={
            submitting ||
            configLoading ||
            subLoading ||
            (!isPremium && isLoggedIn && !stripeReady)
          }
          onAction={() => {
            if (!isLoggedIn) {
              navigate("/");
              return;
            }
            if (isPremium) {
              void openPortal();
            } else {
              void startCheckout();
            }
          }}
        />
      </div>

      <SubscriptionDebugPanel />

      <Footer />
    </div>
  );

  return isLoggedIn ? (
    <AppLayout>{body}</AppLayout>
  ) : (
    <div className="min-h-screen bg-background py-8">{body}</div>
  );
};

interface PlanCardProps {
  title: string;
  badge?: React.ReactNode;
  highlighted?: boolean;
  isCurrent?: boolean;
  features: string[];
  actionLabel: string;
  actionDisabled?: boolean;
  onAction?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  badge,
  highlighted,
  isCurrent,
  features,
  actionLabel,
  actionDisabled,
  onAction,
}) => (
  <div
    className={`rounded-2xl p-6 bg-card shadow-soft border ${
      highlighted ? "border-primary ring-2 ring-primary/30" : "border-border"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-heading font-bold text-foreground">{title}</h2>
      {badge}
    </div>
    <ul className="space-y-2 mb-6">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    {actionLabel && (
      <Button
        className="w-full"
        disabled={actionDisabled}
        onClick={onAction}
        variant={isCurrent && !highlighted ? "outline" : "default"}
      >
        {highlighted && !isCurrent && (
          <Sparkles className="h-4 w-4 mr-1.5" />
        )}
        {actionLabel}
      </Button>
    )}
  </div>
);

export default PricingPage;
