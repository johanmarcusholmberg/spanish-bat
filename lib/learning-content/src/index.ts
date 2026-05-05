/**
 * Canonical Spanish learning content (grammar lessons + reading passages)
 * shared by `@workspace/api-server` (which serves it over HTTP) and
 * `@workspace/mobile` (which can also import it directly for sync use in
 * `practiceItems.ts`). The web app keeps its own richer content shape in
 * `artifacts/murcielingo/src/data/` for now.
 */
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface GrammarMcQuestion {
  id: string;
  prompt: { es: string; en: string; sv: string };
  options: string[];
  answer: string;
  explanation?: { en: string; sv: string };
}

export interface GrammarLesson {
  id: string;
  level: Level;
  title: { en: string; sv: string };
  summary: { en: string; sv: string };
  explanation: { en: string; sv: string };
  examples: { es: string; en: string; sv: string }[];
  questions: GrammarMcQuestion[];
}

export interface ReadingQuestion {
  id: string;
  prompt: { en: string; sv: string };
  options: string[];
  answer: string;
}

export interface ReadingPassage {
  id: string;
  level: Level;
  title: { en: string; sv: string };
  /** Always Spanish source text */
  text: string;
  translation: { en: string; sv: string };
  questions: ReadingQuestion[];
}

export { GRAMMAR_LESSONS } from "./grammarLessons";
export { READING_PASSAGES } from "./readingPassages";
