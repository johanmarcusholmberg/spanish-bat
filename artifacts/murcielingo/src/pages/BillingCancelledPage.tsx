import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const copy = {
  sv: {
    title: "Betalningen avbröts",
    desc: "Inga pengar drogs. Du kan försöka igen när du vill.",
    back: "Tillbaka till priser",
    dashboard: "Till dashboarden",
  },
  en: {
    title: "Checkout cancelled",
    desc: "No charge was made. You can try again whenever you're ready.",
    back: "Back to pricing",
    dashboard: "Go to dashboard",
  },
};

const BillingCancelledPage: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-md mx-auto text-center py-16 px-4 animate-fade-in">
        <XCircle className="h-14 w-14 text-amber-500 mx-auto mb-6" />
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          {t.title}
        </h1>
        <p className="text-muted-foreground mb-6">{t.desc}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate("/pricing")}>{t.back}</Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            {t.dashboard}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BillingCancelledPage;
