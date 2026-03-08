import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <button
        onClick={() => setLanguage("sv")}
        className={`w-[42px] py-1 rounded-full text-sm font-medium transition-all text-center ${
          language === "sv"
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        SV
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`w-[42px] py-1 rounded-full text-sm font-medium transition-all text-center ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
