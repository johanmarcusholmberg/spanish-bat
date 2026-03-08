import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <button
        onClick={() => setLanguage("sv")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          language === "sv"
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        {t("swedish")}
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        {t("english")}
      </button>
    </div>
  );
};

export default LanguageToggle;
