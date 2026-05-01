import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { ValidatedSelection } from "@/lib/selectionUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookPlus,
  Check,
  Edit3,
  Loader2,
  Volume2,
  X,
  Trash2,
} from "lucide-react";

interface SelectionContentProps {
  selection: ValidatedSelection;
  onClose: () => void;
  onSaved?: () => void;
  /** Makes buttons larger for touch */
  mobile?: boolean;
}

const SelectionContent: React.FC<SelectionContentProps> = ({
  selection,
  onClose,
  onSaved,
  mobile = false,
}) => {
  const { language } = useLanguage();
  const { translate, isTranslating } = useTranslate();
  const { addWord, removeWord, words } = useVocabulary();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();

  const [translation, setTranslation] = useState("");
  const [itemType, setItemType] = useState(selection.type);
  const [learned, setLearned] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const normalizedText = selection.text.toLowerCase().trim();
  const existingWord = words.find(w => w.spanish.toLowerCase().trim() === normalizedText);
  const isDuplicate = !!existingWord;

  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  const typeLabel = {
    word: t("Ord", "Word"),
    phrase: t("Fras", "Phrase"),
    sentence: t("Mening", "Sentence"),
  };

  // Auto-translate on mount
  useEffect(() => {
    if (existingWord) {
      setTranslation(existingWord.translation);
      setItemType(existingWord.item_type as any);
      setLearned(existingWord.learned);
      return;
    }
    let cancelled = false;
    translate(selection.text, language === "sv" ? "sv" : "en").then(result => {
      if (!cancelled && result) {
        setTranslation(result.translation);
        setItemType(result.itemType);
      }
    });
    return () => { cancelled = true; };
  }, [selection.text]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!selection.text.trim() || !translation.trim()) return;
    setSaving(true);
    const success = await addWord(selection.text, translation, undefined, "conversation", learned, itemType);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => { onSaved?.(); onClose(); }, 900);
    }
  };

  const handleRemove = async () => {
    if (!existingWord) return;
    setSaving(true);
    await removeWord(existingWord.id);
    setSaving(false);
    onClose();
  };

  if (!selection.isValid) {
    return (
      <div className="p-3 text-center">
        <p className="text-sm text-destructive">{selection.error}</p>
        <Button size="sm" variant="ghost" onClick={onClose} className="mt-2">
          {t("Stäng", "Close")}
        </Button>
      </div>
    );
  }

  const btnSize = mobile ? "default" : "sm" as const;
  const btnH = mobile ? "h-11" : "h-8";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookPlus className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">
            {isDuplicate ? t("Redan i ordbok", "Already saved") : t("Spara till ordbok", "Save to dictionary")}
          </span>
        </div>
        {!mobile && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition p-0.5">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Selected text */}
      <div className="rounded-lg bg-muted p-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-medium text-foreground break-words ${mobile ? "text-base" : "text-sm"}`}>
            {selection.text}
          </p>
          {ttsSupported && (
            <button
              onClick={() => speak(selection.text)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition p-1"
            >
              <Volume2 className={mobile ? "h-5 w-5" : "h-4 w-4"} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {typeLabel[itemType]}
          </Badge>
          {isDuplicate && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">
              {t("Finns redan", "Saved")}
            </Badge>
          )}
        </div>
      </div>

      {/* Translation */}
      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {t("Översättning", "Translation")}
        </label>
        {isTranslating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("Översätter...", "Translating...")}
          </div>
        ) : editingTranslation ? (
          <Input
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className={`${mobile ? "h-11 text-base" : "h-8 text-sm"} mt-0.5`}
            autoFocus
            onBlur={() => setEditingTranslation(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingTranslation(false)}
          />
        ) : (
          <div
            className="flex items-center gap-1 cursor-pointer group mt-0.5"
            onClick={() => setEditingTranslation(true)}
          >
            <p className={`text-foreground ${mobile ? "text-base" : "text-sm"}`}>{translation || "—"}</p>
            <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          </div>
        )}
      </div>

      {/* Learned checkbox */}
      {!isDuplicate && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="sel-learned"
            checked={learned}
            onCheckedChange={(v) => setLearned(v === true)}
          />
          <label htmlFor="sel-learned" className={`text-muted-foreground cursor-pointer ${mobile ? "text-sm" : "text-xs"}`}>
            {t("Markera som redan lärd", "Mark as already learned")}
          </label>
        </div>
      )}

      {/* Actions */}
      {saved ? (
        <div className="flex items-center justify-center gap-1.5 text-sm text-primary py-1">
          <Check className="h-4 w-4" />
          {t("Sparat!", "Saved!")}
        </div>
      ) : (
        <div className={`flex gap-2 ${mobile ? "flex-col" : ""}`}>
          {isDuplicate ? (
            <>
              <Button
                size={btnSize}
                className={`flex-1 ${btnH} text-xs`}
                onClick={handleSave}
                disabled={saving || !translation.trim() || isTranslating}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : t("Uppdatera", "Update")}
              </Button>
              <Button
                size={btnSize}
                variant="destructive"
                className={`${btnH} text-xs`}
                onClick={handleRemove}
                disabled={saving}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {t("Ta bort", "Remove")}
              </Button>
            </>
          ) : (
            <Button
              size={btnSize}
              className={`flex-1 ${btnH} text-xs`}
              onClick={handleSave}
              disabled={saving || !translation.trim() || isTranslating}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : t("Spara", "Save")}
            </Button>
          )}
          <Button size={btnSize} variant="outline" className={`${btnH} text-xs`} onClick={onClose}>
            {t("Avbryt", "Cancel")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectionContent;
