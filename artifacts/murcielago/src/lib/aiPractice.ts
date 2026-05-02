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
  /** Optional abort signal for in-flight cancellation. */
  signal?: AbortSignal;
  /** Override locale; default English. */
  lang?: "en" | "sv";
}

// ── Sentence variations ────────────────────────────────────────────────

export interface SentenceVariation {
  spanish: string;
  translation: string;
  source: "ai" | "fallback";
}

/**
 * Produce a small set of paraphrases / variations of a known sentence.
 * Used to keep echo / sentence-builder practice feeling fresh.
 *
 * TODO(ai): swap the body for a call to the AI integrations proxy
 * (see .local/skills/ai-integrations-*). For now we return the original
 * sentence so callers can render something useful immediately.
 */
export async function generatePracticeVariation(
  base: { spanish: string; translation: string },
  count: number = 1,
  _opts: AiCallOptions = {},
): Promise<SentenceVariation[]> {
  return Array.from({ length: Math.max(1, count) }, () => ({
    spanish: base.spanish,
    translation: base.translation,
    source: "fallback" as const,
  }));
}

// ── Short dialogues per level ──────────────────────────────────────────

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

/**
 * Generate a tiny dialogue suitable for the user's level. The fallback
 * leans on a generic café exchange so Today's Practice still has
 * conversation content even with no model wired up.
 *
 * TODO(ai): replace fallback with an AI call constrained by `level`
 * (CEFR) and the user's current weak grammar topics.
 */
export async function generateDialogueForLevel(
  level: Level,
  scenario: string = "cafe",
  _opts: AiCallOptions = {},
): Promise<GeneratedDialogue> {
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

// ── Echo phrases from weak words ───────────────────────────────────────

export interface EchoPhrase {
  spanish: string;
  translation: string;
  highlightWord?: string;
  source: "ai" | "fallback";
}

/**
 * Take a list of weak vocabulary items and produce short, speakable
 * phrases that re-use them. Echo loops then walk the learner through
 * see → hear → echo → build → use for each phrase.
 *
 * TODO(ai): build a prompt that asks for level-appropriate, natural
 * Spanish using the supplied weak words. Until then we return a simple
 * "Es importante practicar X." template per word.
 */
export async function generateEchoPhrases(
  weakWords: Array<{ spanish: string; translation: string }>,
  _opts: AiCallOptions = {},
): Promise<EchoPhrase[]> {
  return weakWords.slice(0, 6).map((w) => ({
    spanish: `Es importante practicar "${w.spanish}".`,
    translation: `It's important to practice "${w.translation}".`,
    highlightWord: w.spanish,
    source: "fallback",
  }));
}

// ── Mistake explanations ───────────────────────────────────────────────

export interface MistakeExplanation {
  message: { en: string; sv: string };
  /** One short, actionable suggestion the learner can try next time. */
  tip?: { en: string; sv: string };
  source: "ai" | "fallback";
}

/**
 * Explain a learner's mistake in warm, plain language. Used by exercise
 * feedback panels and the upcoming "review your last session" view.
 *
 * TODO(ai): swap fallback for a brief LLM-generated explanation gated by
 * the mistake kind so explanations don't drift into incorrect grammar
 * advice.
 */
export async function explainMistake(input: {
  userAnswer: string;
  correctAnswer: string;
  context?: string;
  _opts?: AiCallOptions;
}): Promise<MistakeExplanation> {
  const { userAnswer, correctAnswer } = input;
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

// ── Weak-word session generator ────────────────────────────────────────

export interface WeakWordSessionItem {
  prompt: { en: string; sv: string };
  spanish: string;
  translation: string;
  /** Suggested exercise type the runner should use. */
  exerciseType: "echo" | "fill_blank" | "translate" | "speak";
}

/**
 * Compose a small focused session around the user's weak words. This is
 * a thin convenience over `generateEchoPhrases` plus an exercise-type
 * pick — UIs that already have a session runner can call this directly.
 */
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
