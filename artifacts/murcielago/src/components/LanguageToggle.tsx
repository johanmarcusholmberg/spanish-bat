import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

type Size = "sm" | "md";

interface LanguageToggleProps {
  size?: Size;
  showIcon?: boolean;
  className?: string;
}

const OPTIONS: { code: "sv" | "en"; flag: string; label: string }[] = [
  { code: "sv", flag: "🇸🇪", label: "SV" },
  { code: "en", flag: "🇬🇧", label: "EN" },
];

const LanguageToggle = ({ size = "md", showIcon = true, className = "" }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const isSm = size === "sm";
  const pillPad = isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm";
  const wrapPad = isSm ? "px-1.5 py-1 gap-1" : "px-2 py-1 gap-1.5";

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={`inline-flex items-center bg-card border border-border rounded-full shadow-sm ${wrapPad} ${className}`}
    >
      {showIcon && (
        <Globe className={`${isSm ? "h-3.5 w-3.5" : "h-4 w-4"} text-muted-foreground ml-1`} aria-hidden />
      )}
      {OPTIONS.map(({ code, flag, label }) => {
        const active = language === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={code === "sv" ? "Svenska" : "English"}
            onClick={() => setLanguage(code)}
            className={`${pillPad} rounded-full font-medium transition-all flex items-center gap-1 ${
              active
                ? "bg-primary text-primary-foreground shadow-warm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span aria-hidden className={isSm ? "text-sm" : "text-base"}>
              {flag}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
