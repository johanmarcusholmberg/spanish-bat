import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { api } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import PremiumBadge from "@/components/PremiumBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const copy = {
  sv: {
    back: "Tillbaka",
    title: "Hantera abonnemang",
    plan: "Plan",
    status: "Status",
    renews: "Förnyas",
    cancelsOn: "Avslutas",
    portalCta: "Öppna Stripes kundportal",
    portalDesc:
      "Uppdatera betalkort, ladda ner kvitton eller säg upp via Stripes säkra portal.",
    upgrade: "Uppgradera till Premium",
    notPremium: "Du har ingen aktiv premiumprenumeration.",
    failed: "Kunde inte öppna portalen.",
  },
  en: {
    back: "Back",
    title: "Manage subscription",
    plan: "Plan",
    status: "Status",
    renews: "Renews",
    cancelsOn: "Ends",
    portalCta: "Open Stripe customer portal",
    portalDesc:
      "Update payment method, download receipts or cancel via Stripe's secure portal.",
    upgrade: "Upgrade to Premium",
    notPremium: "You don't have an active premium subscription.",
    failed: "Couldn't open the portal.",
  },
};

const ManageSubscriptionPage: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const navigate = useNavigate();
  const { isPremium, planId, status, data, loading } = useSubscription();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const sub = data?.subscription;
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString(
        language === "sv" ? "sv-SE" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      )
    : null;

  const openPortal = async () => {
    setSubmitting(true);
    try {
      const { url } = await api.stripe.portal();
      window.location.href = url;
    } catch (err) {
      toast({
        title: t.failed,
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">
          {t.title}
        </h1>

        <div className="bg-card rounded-lg p-6 shadow-soft border border-border mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground tracking-wide">
                {t.plan}
              </div>
              <div className="text-lg font-semibold text-foreground capitalize flex items-center gap-2">
                {planId} {isPremium && <PremiumBadge size="sm" />}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase text-muted-foreground tracking-wide">
                {t.status}
              </div>
              <div className="text-sm font-medium text-foreground capitalize">
                {status}
              </div>
            </div>
          </div>

          {periodEnd && (
            <div className="text-sm text-muted-foreground">
              {sub?.cancelAtPeriodEnd ? t.cancelsOn : t.renews}: {periodEnd}
            </div>
          )}
        </div>

        {loading ? null : isPremium ? (
          <div className="bg-card rounded-lg p-6 shadow-soft border border-border">
            <p className="text-sm text-muted-foreground mb-4">{t.portalDesc}</p>
            <Button onClick={openPortal} disabled={submitting}>
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {t.portalCta}
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-6 shadow-soft border border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">{t.notPremium}</p>
            <Button onClick={() => navigate("/pricing")}>{t.upgrade}</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ManageSubscriptionPage;
