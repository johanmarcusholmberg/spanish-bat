/**
 * Convert persisted (DB-backed) practice items into the mobile MCQ
 * shape used by `buildPracticeSession`. Mirrors the web adapter but
 * synthesises distractors so AI/free-form items can render with the
 * existing MCQ component.
 */

import type { MobilePracticeItem } from "@/lib/practiceItems";
import type { Level } from "@/lib/mockContent";

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

const FALLBACK_DISTRACTORS = [
  "No lo sé.",
  "Tal vez mañana.",
  "Está bien.",
  "Hasta luego.",
  "De nada.",
  "Por favor.",
];

export function savedItemsToPracticeItems(
  raw: SavedPracticeItem[],
  interfaceLanguage: "en" | "sv",
): MobilePracticeItem[] {
  const answers = raw.map((r) => r.expectedAnswer).filter(Boolean);
  const out: MobilePracticeItem[] = [];
  for (const it of raw) {
    const fromBatch = answers
      .filter((a) => a !== it.expectedAnswer)
      .slice(0, 3);
    const distractors = [...fromBatch];
    for (const f of FALLBACK_DISTRACTORS) {
      if (distractors.length >= 3) break;
      if (f !== it.expectedAnswer && !distractors.includes(f))
        distractors.push(f);
    }
    if (distractors.length < 2) continue;
    const opts = [it.expectedAnswer, ...distractors.slice(0, 3)];
    for (let j = opts.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [opts[j], opts[k]] = [opts[k], opts[j]];
    }
    const promptLang = it.languageOfPrompt === "sv" ? "sv" : "en";
    const promptObj =
      promptLang === interfaceLanguage
        ? interfaceLanguage === "sv"
          ? { sv: it.prompt, en: it.prompt }
          : { en: it.prompt, sv: it.prompt }
        : { en: it.prompt, sv: it.prompt };
    out.push({
      id: `saved-${it.id}`,
      skill: (it.skill as MobilePracticeItem["skill"]) ?? "vocabulary",
      level: (it.level as Level) ?? "A1",
      category: it.subskill || "general",
      payload: {
        kind: "mcq",
        prompt: promptObj,
        options: opts,
        answer: it.expectedAnswer,
        explanation: it.explanation
          ? promptLang === "sv"
            ? { sv: it.explanation, en: it.explanation }
            : { en: it.explanation, sv: it.explanation }
          : undefined,
        lessonId: `saved-${it.subskill}`,
        source: "ai",
      },
    });
  }
  return out;
}

export function persistedIdFromLocalId(localId: string): string | null {
  if (localId.startsWith("saved-")) return localId.slice("saved-".length);
  return null;
}
