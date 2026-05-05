import React from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface LockedFeatureProps {
  title?: string;
  description?: string;
  className?: string;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({
  title,
  description,
  className,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    sv: {
      title: "Premiumfunktion",
      desc: "Den här funktionen ingår i Premium. Uppgradera för att låsa upp den.",
      cta: "Se priser",
    },
    en: {
      title: "Premium feature",
      desc: "This feature is part of Premium. Upgrade to unlock it.",
      cta: "See pricing",
    },
  }[language];

  return (
    <div
      className={`rounded-lg border border-dashed border-amber-300 bg-amber-50/60 dark:bg-amber-900/10 p-6 text-center ${
        className ?? ""
      }`}
    >
      <Lock className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
      <h3 className="font-heading font-semibold text-foreground mb-2">
        {title ?? t.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description ?? t.desc}
      </p>
      <Button onClick={() => navigate("/pricing")}>{t.cta}</Button>
    </div>
  );
};

export default LockedFeature;
