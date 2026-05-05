import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageCode } from "@/i18n/languages";

type Size = "sm" | "md";
type Variant = "pill" | "minimal" | "globe";

interface LanguageToggleProps {
  size?: Size;
  showIcon?: boolean;
  className?: string;
  variant?: Variant;
  /** Optional handler called after the language changes (e.g. to sync to profile). */
  onChange?: (code: LanguageCode) => void;
  /** Whether to show the short language code next to the globe icon. */
  showCode?: boolean;
  /** Extra classes applied to the language code span (globe variant). */
  codeClassName?: string;
}

const shortCode = (code: string) => code.toUpperCase();

const LanguageToggle = ({
  size = "md",
  showIcon = true,
  className = "",
  variant = "pill",
  onChange,
  showCode = true,
  codeClassName = "",
}: LanguageToggleProps) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    onChange?.(code);
  };

  if (variant === "globe") {
    const current =
      availableLanguages.find((o) => o.code === language) ?? availableLanguages[0];
    const triggerLabel = t("appLanguage") || "Language";
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={triggerLabel}
          title={triggerLabel}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
          <Globe className="h-4 w-4" aria-hidden />
          {showCode && current ? (
            <span className={codeClassName}>{shortCode(current.code)}</span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {t("chooseLanguage") || "Choose language"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableLanguages.map(({ code, flag, nativeLabel }) => {
            const active = language === code;
            return (
              <DropdownMenuItem
                key={code}
                onSelect={() => handleSelect(code)}
                className="gap-2 cursor-pointer"
                aria-checked={active}
                role="menuitemradio"
              >
                {flag ? (
                  <span aria-hidden className="text-base">
                    {flag}
                  </span>
                ) : null}
                <span className="flex-1">{nativeLabel}</span>
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
        aria-label={t("appLanguage") || "Language"}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        {availableLanguages.map(({ code, nativeLabel }, i) => {
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
                aria-label={nativeLabel}
                onClick={() => handleSelect(code)}
                className={`text-xs tracking-wide font-${active ? "bold" : "medium"} transition-colors ${
                  active
                    ? "text-peach-dark"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {shortCode(code)}
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
      aria-label={t("appLanguage") || "Language"}
      className={`inline-flex items-center bg-card border border-border rounded-full shadow-sm ${wrapPad} ${className}`}
    >
      {showIcon && (
        <Globe className={`${isSm ? "h-3.5 w-3.5" : "h-4 w-4"} text-muted-foreground ml-1`} aria-hidden />
      )}
      {availableLanguages.map(({ code, flag, nativeLabel }) => {
        const active = language === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={nativeLabel}
            onClick={() => handleSelect(code)}
            className={`${pillPad} rounded-full font-medium transition-all flex items-center gap-1 ${
              active
                ? "bg-primary text-primary-foreground shadow-warm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {flag ? (
              <span aria-hidden className={isSm ? "text-sm" : "text-base"}>
                {flag}
              </span>
            ) : null}
            <span>{shortCode(code)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
