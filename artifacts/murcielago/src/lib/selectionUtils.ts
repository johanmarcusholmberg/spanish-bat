/**
 * Validate and classify a text selection for vocabulary saving.
 */

export type SelectionType = "word" | "phrase" | "sentence";

export interface ValidatedSelection {
  text: string;
  type: SelectionType;
  isValid: boolean;
  error?: string;
}

const PUNCTUATION_ONLY = /^[\s¡¿!?.,;:()"""''«»\-—–…]+$/;

export function validateSelection(raw: string, lang: "sv" | "en" = "sv"): ValidatedSelection {
  const text = raw.replace(/\s+/g, " ").trim();

  if (!text || text.length < 1) {
    return { text, type: "word", isValid: false, error: lang === "sv" ? "Tomt val" : "Empty selection" };
  }

  if (PUNCTUATION_ONLY.test(text)) {
    return { text, type: "word", isValid: false, error: lang === "sv" ? "Bara skiljetecken" : "Punctuation only" };
  }

  if (text.length > 500) {
    return { text: text.slice(0, 500), type: "sentence", isValid: false, error: lang === "sv" ? "För lång text (max 500 tecken)" : "Text too long (max 500 chars)" };
  }

  const type = classifyText(text);
  return { text, type, isValid: true };
}

export function classifyText(text: string): SelectionType {
  const trimmed = text.trim();
  // Sentence: ends with sentence-ending punctuation or has 6+ words
  const wordCount = trimmed.split(/\s+/).length;
  if (/[.!?¡¿]/.test(trimmed) && wordCount >= 3) return "sentence";
  if (wordCount >= 6) return "sentence";
  if (wordCount >= 2) return "phrase";
  return "word";
}
