import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TranslationResult {
  translation: string;
  itemType: "word" | "phrase" | "sentence";
  original: string;
}

export const useTranslate = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (text: string, targetLang = "sv"): Promise<TranslationResult | null> => {
    if (!text.trim()) return null;
    setIsTranslating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-word`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ text: text.trim(), targetLang }),
        }
      );

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
