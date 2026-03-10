import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookPlus,
  Check,
  Edit3,
  Loader2,
  X,
} from "lucide-react";

interface SelectionPopupProps {
  /** CSS selector or ref for the container to listen for selections */
  containerRef: React.RefObject<HTMLElement>;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ containerRef }) => {
  const { language } = useLanguage();
  const { translate, isTranslating } = useTranslate();
  const { addWord, words } = useVocabulary();

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [translation, setTranslation] = useState("");
  const [itemType, setItemType] = useState<"word" | "phrase" | "sentence">("word");
  const [learned, setLearned] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setVisible(false);
    setSelectedText("");
    setTranslation("");
    setEditingTranslation(false);
    setSaved(false);
    setIsDuplicate(false);
    setLearned(false);
  }, []);

  const handleSelection = useCallback(async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

    const text = selection.toString().trim();
    if (text.length < 1 || text.length > 500) return;

    // Make sure selection is within our container
    const container = containerRef.current;
    if (!container) return;
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !container.contains(anchorNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check for duplicate
    const normalizedText = text.toLowerCase().trim();
    const dup = words.some(w => w.spanish.toLowerCase().trim() === normalizedText);

    setSelectedText(text);
    setIsDuplicate(dup);
    setSaved(false);
    setLearned(false);
    setEditingTranslation(false);

    // Position popup above selection
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setVisible(true);

    // Auto-translate
    const result = await translate(text, language === "sv" ? "sv" : "en");
    if (result) {
      setTranslation(result.translation);
      setItemType(result.itemType as "word" | "phrase" | "sentence");
    }
  }, [containerRef, translate, language, words]);

  useEffect(() => {
    const handler = () => {
      // Small delay to let selection finalize
      setTimeout(handleSelection, 150);
    };

    document.addEventListener("mouseup", handler);
    document.addEventListener("touchend", handler);

    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("touchend", handler);
    };
  }, [handleSelection]);

  // Close on click outside
  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        close();
      }
    };
    // Delay to prevent immediate close
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [visible, close]);

  const handleSave = async () => {
    if (!selectedText.trim() || !translation.trim()) return;
    setSaving(true);
    const success = await addWord(selectedText, translation, undefined, "conversation", learned, itemType);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(close, 1200);
    }
  };

  if (!visible) return null;

  const typeLabel = {
    word: language === "sv" ? "Ord" : "Word",
    phrase: language === "sv" ? "Fras" : "Phrase",
    sentence: language === "sv" ? "Mening" : "Sentence",
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="w-72 rounded-xl border bg-popover p-3 shadow-lg text-popover-foreground">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookPlus className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">
              {language === "sv" ? "Spara till ordbok" : "Save to dictionary"}
            </span>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground transition p-0.5">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Selected text */}
        <div className="rounded-lg bg-muted p-2 mb-2">
          <p className="text-sm font-medium text-foreground break-words">{selectedText}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {typeLabel[itemType]}
            </Badge>
            {isDuplicate && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {language === "sv" ? "Finns redan" : "Duplicate"}
              </Badge>
            )}
          </div>
        </div>

        {/* Translation */}
        <div className="mb-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {language === "sv" ? "Översättning" : "Translation"}
          </label>
          {isTranslating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {language === "sv" ? "Översätter..." : "Translating..."}
            </div>
          ) : editingTranslation ? (
            <Input
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="h-8 text-sm mt-0.5"
              autoFocus
              onBlur={() => setEditingTranslation(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTranslation(false)}
            />
          ) : (
            <div
              className="flex items-center gap-1 cursor-pointer group mt-0.5"
              onClick={() => setEditingTranslation(true)}
            >
              <p className="text-sm text-foreground">{translation || "—"}</p>
              <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </div>
          )}
        </div>

        {/* Learned checkbox */}
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="sel-learned"
            checked={learned}
            onCheckedChange={(v) => setLearned(v === true)}
          />
          <label htmlFor="sel-learned" className="text-xs text-muted-foreground cursor-pointer">
            {language === "sv" ? "Markera som redan lärd" : "Mark as already learned"}
          </label>
        </div>

        {/* Actions */}
        {saved ? (
          <div className="flex items-center justify-center gap-1.5 text-sm text-primary py-1">
            <Check className="h-4 w-4" />
            {language === "sv" ? "Sparat!" : "Saved!"}
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleSave}
              disabled={saving || !translation.trim() || isTranslating}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                isDuplicate
                  ? (language === "sv" ? "Uppdatera" : "Update")
                  : (language === "sv" ? "Spara" : "Save")
              )}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={close}>
              {language === "sv" ? "Avbryt" : "Cancel"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionPopup;
