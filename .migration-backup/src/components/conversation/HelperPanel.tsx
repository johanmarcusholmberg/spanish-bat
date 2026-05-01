import React from "react";
import { X, Lightbulb, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface HelperPanelProps {
  type: "hint" | "translate" | null;
  content: string;
  isLoading: boolean;
  onClose: () => void;
}

const HelperPanel: React.FC<HelperPanelProps> = ({ type, content, isLoading, onClose }) => {
  const { language } = useLanguage();

  if (!type) return null;

  const isHint = type === "hint";
  const icon = isHint ? (
    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
  ) : (
    <Languages className="h-4 w-4 text-blue-500 shrink-0" />
  );
  const label = isHint
    ? language === "sv" ? "Ledtråd" : "Hint"
    : language === "sv" ? "Översättning" : "Translation";

  return (
    <div
      className={`mb-3 rounded-xl border-2 p-3 animate-in slide-in-from-bottom-2 duration-200 ${
        isHint
          ? "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"
          : "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          <span>{label}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {isLoading && !content ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {language === "sv" ? "Laddar..." : "Loading..."}
        </div>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
};

export default HelperPanel;
