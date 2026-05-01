import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookmarkPlus, Check, Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentenceWordPickerProps {
  sentence: string;
  context?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SentenceWordPicker: React.FC<SentenceWordPickerProps> = ({
  sentence,
  context,
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const { translate, isTranslating } = useTranslate();
  const { addWord, words } = useVocabulary();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const isMobile = useIsMobile();

  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  // Split sentence into clickable tokens
  const tokens = sentence.split(/(\s+)/).filter(Boolean);
  const wordTokens = tokens.map((token, idx) => ({
    token,
    idx,
    isWord: /\S/.test(token),
    cleaned: token.replace(/[¡¿!?.,;:()"""''«»\-—–…]/g, "").toLowerCase().trim(),
  }));

  const isWordSaved = (cleaned: string) =>
    words.some(w => w.spanish.toLowerCase().trim() === cleaned) || savedItems.has(cleaned);

  const toggleWord = (idx: number) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getSelectedText = () => {
    if (selectedWords.size === 0) return "";
    const sorted = Array.from(selectedWords).sort((a, b) => a - b);
    // Check if consecutive
    const isConsecutive = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1 ||
      // Allow whitespace tokens between
      !wordTokens[sorted[i - 1] + 1]?.isWord
    );

    if (isConsecutive || sorted.length === 1) {
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      return tokens.slice(min, max + 1).join("").trim();
    }
    // Non-consecutive: join selected words
    return sorted.map(i => tokens[i]).join(" ").trim();
  };

  const handleSaveSelected = async () => {
    const text = getSelectedText();
    if (!text) return;
    setSaving(true);
    const result = await translate(text, language === "sv" ? "sv" : "en");
    if (result) {
      const success = await addWord(
        text, result.translation, context || sentence,
        "exercise", false, result.itemType,
      );
      if (success) {
        setSavedItems(prev => new Set([...prev, text.toLowerCase().trim()]));
        setSelectedWords(new Set());
      }
    }
    setSaving(false);
  };

  const handleSaveFullSentence = async () => {
    setSaving(true);
    const result = await translate(sentence, language === "sv" ? "sv" : "en");
    if (result) {
      const success = await addWord(
        sentence, result.translation, context,
        "exercise", false, "sentence",
      );
      if (success) {
        setSavedItems(prev => new Set([...prev, sentence.toLowerCase().trim()]));
      }
    }
    setSaving(false);
  };

  const content = (
    <div className="space-y-4 pb-2">
      <p className="text-sm text-muted-foreground">
        {t("Tryck på ord du vill spara, eller spara hela meningen", "Tap words to save, or save the full sentence")}
      </p>

      {/* Word tokens */}
      <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl min-h-[3rem]">
        {wordTokens.map(({ token, idx, isWord, cleaned }) => {
          if (!isWord) return <span key={idx} />;
          const selected = selectedWords.has(idx);
          const alreadySaved = isWordSaved(cleaned);

          return (
            <button
              key={idx}
              onClick={() => !alreadySaved && toggleWord(idx)}
              disabled={alreadySaved}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                alreadySaved
                  ? "bg-primary/10 text-primary cursor-default"
                  : selected
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-card text-foreground hover:bg-accent active:scale-95 border border-border",
              )}
            >
              {token}
              {alreadySaved && <Check className="inline h-3 w-3 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* TTS */}
      {ttsSupported && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => speak(selectedWords.size > 0 ? getSelectedText() : sentence)} className="gap-1.5 text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            {t("Lyssna", "Listen")}
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {selectedWords.size > 0 && (
          <Button onClick={handleSaveSelected} disabled={saving || isTranslating} className="w-full gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
            {t("Spara", "Save")} "{getSelectedText().slice(0, 30)}{getSelectedText().length > 30 ? "…" : ""}"
          </Button>
        )}
        <Button
          variant={selectedWords.size > 0 ? "outline" : "default"}
          onClick={handleSaveFullSentence}
          disabled={saving || isTranslating || isWordSaved(sentence.toLowerCase().trim())}
          className="w-full gap-1.5"
        >
          {saving && selectedWords.size === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
          {isWordSaved(sentence.toLowerCase().trim())
            ? t("Mening redan sparad", "Sentence already saved")
            : t("Spara hela meningen", "Save full sentence")}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-base">{t("Spara till ordbok", "Save to dictionary")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 pt-2">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Spara till ordbok", "Save to dictionary")}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default SentenceWordPicker;
