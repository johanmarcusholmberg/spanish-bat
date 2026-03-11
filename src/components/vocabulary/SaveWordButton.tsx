import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveWordButtonProps {
  spanish: string;
  context?: string;
  variant?: "icon" | "button";
  className?: string;
}

const SaveWordButton: React.FC<SaveWordButtonProps> = ({
  spanish,
  context,
  variant = "icon",
  className,
}) => {
  const { language } = useLanguage();
  const { translate } = useTranslate();
  const { addWord, words } = useVocabulary();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = (sv: string, en: string) => (language === "sv" ? sv : en);
  const normalizedText = spanish.toLowerCase().trim();
  const alreadySaved = words.some(w => w.spanish.toLowerCase().trim() === normalizedText);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving || saved || alreadySaved) return;

    setSaving(true);
    const result = await translate(spanish, language === "sv" ? "sv" : "en");
    if (result) {
      const success = await addWord(
        spanish,
        result.translation,
        context,
        "exercise",
        false,
        result.itemType,
        result.usageExample,
      );
      if (success) setSaved(true);
    }
    setSaving(false);
  };

  const isDone = saved || alreadySaved;

  if (variant === "icon") {
    return (
      <button
        onClick={handleSave}
        disabled={saving || isDone}
        className={cn(
          "p-1.5 rounded-md transition-all flex-shrink-0",
          isDone
            ? "text-primary cursor-default"
            : "text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20",
          className,
        )}
        title={isDone ? t("Redan sparat", "Already saved") : t("Spara till ordbok", "Save to dictionary")}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isDone ? (
          <Check className="h-4 w-4" />
        ) : (
          <BookmarkPlus className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={saving || isDone}
      className={cn("gap-1.5", className)}
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isDone ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <BookmarkPlus className="h-3.5 w-3.5" />
      )}
      {isDone ? t("Sparat", "Saved") : t("Spara", "Save")}
    </Button>
  );
};

export default SaveWordButton;
