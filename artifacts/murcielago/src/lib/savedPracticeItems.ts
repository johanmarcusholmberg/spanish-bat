/**
 * Convert persisted (DB-backed) practice items into the local
 * `LocalPracticeItem` shape so they slot into `buildPracticeSession`
 * alongside curated, template, and freshly-generated AI items.
 */

import type { LocalPracticeItem } from "@/lib/practiceItems";
import type { Level } from "@/contexts/AuthContext";

export interface SavedPracticeItem {
  id: string;
  level: string;
  skill: string;
  subskill: string;
  prompt: string;
  expectedAnswer: string;
  acceptedAnswers: string[] | null;
  explanation: string | null;
  difficulty: number;
  source: string;
  languageOfPrompt: string;
}

export function savedItemsToPracticeItems(
  raw: SavedPracticeItem[],
  interfaceLanguage: "en" | "sv",
): LocalPracticeItem[] {
  return raw.map((it) => {
    const promptLang = it.languageOfPrompt === "sv" ? "sv" : "en";
    const promptObj =
      promptLang === interfaceLanguage
        ? interfaceLanguage === "sv"
          ? { sv: it.prompt, en: it.prompt }
          : { en: it.prompt, sv: it.prompt }
        : { en: it.prompt, sv: it.prompt };
    const explObj = it.explanation
      ? promptLang === "sv"
        ? { sv: it.explanation, en: it.explanation }
        : { en: it.explanation, sv: it.explanation }
      : undefined;
    return {
      id: `saved-${it.id}`,
      skill: (it.skill as LocalPracticeItem["skill"]) ?? "vocabulary",
      level: (it.level as Level) ?? "A1",
      category: it.subskill || "general",
      payload: {
        kind: "translate",
        prompt: promptObj,
        answer: it.expectedAnswer,
        acceptedAnswers: it.acceptedAnswers ?? undefined,
        category: it.subskill || "general",
        explanation: explObj,
        source: "ai",
      },
    };
  });
}

/** Strip the "saved-" prefix off a local item id, or return null. */
export function persistedIdFromLocalId(localId: string): string | null {
  if (localId.startsWith("saved-")) return localId.slice("saved-".length);
  return null;
}
