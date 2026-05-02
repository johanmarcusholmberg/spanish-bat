/**
 * AI-generated practice — controlled interfaces & safe placeholders.
 *
 * These functions are the single seam through which the rest of the app
 * asks for AI-augmented learning content. Today they return deterministic
 * fallback content so the UI is always functional. Tomorrow they can be
 * wired to a real LLM endpoint without changing call-sites.
 *
 * Design rules (intentional constraints):
 *   - AI is allowed to vary phrasing, generate dialogues, adapt readings,
 *     create echo phrases from weak words, and explain mistakes.
 *   - AI is NOT the source of truth for level progression, curriculum
 *     structure, or grammar correctness. Those continue to come from the
 *     curated content in the API / lib packages.
 *   - Every function returns the same shape whether or not an LLM was
 *     actually called — callers must not branch on "is AI available".
 */

import type { Level } from "@workspace/practice";

export interface AiCallOptions {
  signal?: AbortSignal;
  lang?: "en" | "sv";
}

// ── Sentence variations ────────────────────────────────────────────

export interface SentenceVariation {
  spanish: string;
  translation: string;
  source: "ai" | "fallback";
}

export async function generatePracticeVariation(
  base: { spanish: string; translation: string },
  count: number = 1,
  _opts: AiCallOptions = {},
): Promise<SentenceVariation[]> {
  // TODO(ai): swap for a real AI integrations call.
  return Array.from({ length: Math.max(1, count) }, () => ({
    spanish: base.spanish,
    translation: base.translation,
    source: "fallback" as const,
  }));
}

// ── Short dialogues per level ──────────────────────────────────────

export interface DialogueLine {
  speaker: "A" | "B";
  spanish: string;
  translation: string;
}

export interface GeneratedDialogue {
  scenario: string;
  level: Level;
  lines: DialogueLine[];
  source: "ai" | "fallback";
}

export async function generateDialogueForLevel(
  level: Level,
  scenario: string = "cafe",
  _opts: AiCallOptions = {},
): Promise<GeneratedDialogue> {
  // TODO(ai): replace fallback with an AI call constrained by `level`
  // (CEFR) and the user's current weak grammar topics.
  return {
    scenario,
    level,
    source: "fallback",
    lines: [
      { speaker: "A", spanish: "Hola, ¿qué tal?", translation: "Hi, how's it going?" },
      { speaker: "B", spanish: "Bien, gracias. ¿Y tú?", translation: "Good, thanks. And you?" },
      { speaker: "A", spanish: "Muy bien.", translation: "Very well." },
    ],
  };
}

// ── Echo phrases from weak words ───────────────────────────────────

export interface EchoPhrase {
  spanish: string;
  translation: string;
  highlightWord?: string;
  source: "ai" | "fallback";
}

export async function generateEchoPhrases(
  weakWords: Array<{ spanish: string; translation: string }>,
  _opts: AiCallOptions = {},
): Promise<EchoPhrase[]> {
  // TODO(ai): build a prompt that asks for level-appropriate, natural
  // Spanish using the supplied weak words.
  return weakWords.slice(0, 6).map((w) => ({
    spanish: `Es importante practicar "${w.spanish}".`,
    translation: `It's important to practice "${w.translation}".`,
    highlightWord: w.spanish,
    source: "fallback",
  }));
}

// ── Mistake explanations ───────────────────────────────────────────

export interface MistakeExplanation {
  message: { en: string; sv: string };
  tip?: { en: string; sv: string };
  source: "ai" | "fallback";
}

export async function explainMistake(input: {
  userAnswer: string;
  correctAnswer: string;
  context?: string;
  _opts?: AiCallOptions;
}): Promise<MistakeExplanation> {
  const { userAnswer, correctAnswer } = input;
  // TODO(ai): swap fallback for a brief LLM-generated explanation gated
  // by the mistake kind.
  return {
    message: {
      en: `You wrote "${userAnswer}" — the closer answer is "${correctAnswer}".`,
      sv: `Du skrev "${userAnswer}" — det närmare svaret är "${correctAnswer}".`,
    },
    tip: {
      en: "Read it aloud once before answering — it often catches small slips.",
      sv: "Läs det högt en gång innan du svarar — det fångar ofta små misstag.",
    },
    source: "fallback",
  };
}

// ── Weak-word session generator ────────────────────────────────────

export interface WeakWordSessionItem {
  prompt: { en: string; sv: string };
  spanish: string;
  translation: string;
  exerciseType: "echo" | "fill_blank" | "translate" | "speak";
}

export async function generateWeakWordSession(
  weakWords: Array<{ spanish: string; translation: string }>,
  _opts: AiCallOptions = {},
): Promise<WeakWordSessionItem[]> {
  const phrases = await generateEchoPhrases(weakWords, _opts);
  return phrases.map((p, i) => ({
    prompt: {
      en: `Echo this and try to use "${p.highlightWord ?? ""}" yourself.`,
      sv: `Eka detta och försök själv använda "${p.highlightWord ?? ""}".`,
    },
    spanish: p.spanish,
    translation: p.translation,
    exerciseType: i % 2 === 0 ? "echo" : "speak",
  }));
}
