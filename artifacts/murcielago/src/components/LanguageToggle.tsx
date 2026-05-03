import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Size = "sm" | "md";
type Variant = "pill" | "minimal" | "globe";

interface LanguageToggleProps {
  size?: Size;
  showIcon?: boolean;
  className?: string;
  variant?: Variant;
}

const OPTIONS: { code: "sv" | "en"; flag: string; short: string; long: string }[] = [
  { code: "sv", flag: "🇸🇪", short: "SV", long: "Svenska" },
  { code: "en", flag: "🇬🇧", short: "EN", long: "English" },
];

const LanguageToggle = ({
  size = "md",
  showIcon = true,
  className = "",
  variant = "pill",
}: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  if (variant === "globe") {
    const current = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Change language"
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
          <Globe className="h-3.5 w-3.5" aria-hidden />
          <span>{current.short}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {OPTIONS.map(({ code, flag, long }) => {
            const active = language === code;
            return (
              <DropdownMenuItem
                key={code}
                onSelect={() => setLanguage(code)}
                className="gap-2 cursor-pointer"
              >
                <span aria-hidden className="text-base">
                  {flag}
                </span>
                <span className="flex-1">{long}</span>
                {active ? (
                  <Check className="h-4 w-4 text-peach-dark" aria-hidden />
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "minimal") {
    return (
      <div
        role="radiogroup"
        aria-label="Language"
        className={`inline-flex items-center gap-2 ${className}`}
      >
        {OPTIONS.map(({ code, short }, i) => {
          const active = language === code;
          return (
            <React.Fragment key={code}>
              {i > 0 ? (
                <span aria-hidden className="h-3 w-px bg-border/60" />
              ) : null}
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={code === "sv" ? "Svenska" : "English"}
                onClick={() => setLanguage(code)}
                className={`text-xs tracking-wide font-${active ? "bold" : "medium"} transition-colors ${
                  active
                    ? "text-peach-dark"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {short}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

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
      {OPTIONS.map(({ code, flag, short }) => {
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
            <span>{short}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
