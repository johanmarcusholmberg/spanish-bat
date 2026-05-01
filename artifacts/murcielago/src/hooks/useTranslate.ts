import { useState, useCallback } from "react";

interface TranslationResult {
  translation: string;
  itemType: "word" | "phrase" | "sentence";
  original: string;
  usageExample?: string;
}

export const useTranslate = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (text: string, targetLang = "sv"): Promise<TranslationResult | null> => {
    if (!text.trim()) return null;
    setIsTranslating(true);

    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), targetLang }),
      });

      if (!resp.ok) return null;
      const data = await resp.json();
      return data as TranslationResult;
    } catch (e) {
      console.error("Translation error:", e);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return { translate, isTranslating };
};
