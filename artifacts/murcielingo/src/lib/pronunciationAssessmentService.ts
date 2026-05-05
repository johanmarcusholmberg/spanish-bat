/**
 * pronunciationAssessmentService
 *
 * This is the contract the pronunciation UI talks to. Today it is backed by
 * a transcript-comparison heuristic (Levenshtein + Spanish-sound rules) —
 * it is NOT real acoustic pronunciation scoring. The implementation is
 * intentionally isolated behind this service so a real speech-assessment
 * backend (Azure Pronunciation Assessment, Speechace, or our own model)
 * can be plugged in later without touching the UI.
 *
 * When a real backend exists:
 *  - Replace `assessPronunciation` with a fetch to the assessment endpoint.
 *  - Send: { audio: Blob, expectedText, level } and parse into AssessmentResult.
 *  - Keep the AssessmentResult shape stable.
 */

import type { Level } from "@/contexts/AuthContext";
import {
  analyzePronunciation,
  type PronunciationAnalysis,
} from "./pronunciationAnalysis";

export type AssessmentLevel = "great" | "good" | "needs_practice";

export type SuggestionType =
  | "sound"
  | "rhythm"
  | "stress"
  | "clarity"
  | "missing_word"
  | "extra_word";

export interface AssessmentSuggestion {
  type: SuggestionType;
  /** Human-readable message in the requested UI language. */
  message: string;
  /** Optional target word/sound the suggestion refers to. */
  target?: string;
}

export interface AssessmentResult {
  /** 0–100 overall echo score. */
  score: number;
  level: AssessmentLevel;
  /** What we recognized the user as saying (may be empty). */
  transcript?: string;
  /** The Spanish target the user was asked to echo. */
  expectedText: string;
  suggestions: AssessmentSuggestion[];
  retryRecommended: boolean;
  /**
   * Honest disclosure: this run came from the heuristic placeholder, not
   * a real acoustic model. Used by the UI to display a small disclaimer.
   */
  source: "heuristic_placeholder" | "backend";
  /** Sounds we noticed the learner struggled with (for adaptive practice). */
  weakSounds: string[];
  /** Words we noticed the learner struggled with. */
  weakWords: string[];
  /** Raw analysis – kept for the existing word-by-word UI. */
  analysis: PronunciationAnalysis;
}

export interface AssessmentInput {
  expectedText: string;
  transcript: string;
  level: Level;
  /** UI language for human-readable messages. */
  uiLang: "sv" | "en";
}

/* ------------------------------------------------------------------ */
/* Spanish-specific sound detection                                   */
/* ------------------------------------------------------------------ */

interface SoundPattern {
  id: string;
  /** Detect the sound in the target text. */
  test: (target: string) => boolean;
  messageSv: string;
  messageEn: string;
  /** Minimum CEFR level at which we expand the explanation. */
  expandFromLevel?: Level;
  expandSv?: string;
  expandEn?: string;
}

const SOUND_PATTERNS: SoundPattern[] = [
  {
    id: "rolled_rr",
    test: (t) => /rr/i.test(t) || /^r/i.test(t),
    messageSv: 'Rulla "rr" lite mer – låt tungspetsen vibrera.',
    messageEn: 'Roll the "rr" a bit more — let the tip of your tongue vibrate.',
    expandFromLevel: "B1",
    expandSv: "Tänk på det dubbla r:et som ett kort, snabbt mullrande ljud.",
    expandEn: "Think of the double r as a short, fast trilling sound.",
  },
  {
    id: "soft_r",
    // Single 'r' between/after vowels (excluding leading-r and 'rr', already
    // covered by `rolled_rr`). Catches both intervocalic ("pero") and
    // syllable-final ("hablar", "tarde") soft r.
    test: (t) => /[aeiouáéíóú]r(?!r)/i.test(t),
    messageSv: 'Det enkla "r" är mjukt – nästan som ett snabbt "d".',
    messageEn: 'The single "r" is soft — almost like a quick "d".',
  },
  {
    id: "enye",
    test: (t) => /ñ/i.test(t),
    messageSv: 'Uttala "ñ" som "nj" i "njuta".',
    messageEn: 'Pronounce "ñ" like the "ny" in "canyon".',
  },
  {
    id: "j_g",
    test: (t) => /j/i.test(t) || /g[ei]/i.test(t),
    messageSv: 'Gör "j" och "g" före e/i som ett mjukt h-ljud från halsen.',
    messageEn: 'Make "j" and "g" before e/i a soft h-sound from the throat.',
  },
  {
    id: "silent_h",
    test: (t) => /\bh/i.test(t),
    messageSv: 'Bokstaven "h" är tyst – hoppa över ljudet helt.',
    messageEn: 'The letter "h" is silent — skip the sound entirely.',
  },
  {
    id: "ll_y",
    test: (t) => /ll/i.test(t),
    messageSv: '"ll" låter ungefär som "j" i "ja".',
    messageEn: '"ll" sounds roughly like the "y" in "yes".',
  },
  {
    id: "stress_marks",
    test: (t) => /[áéíóú]/.test(t),
    messageSv: "Lägg lite extra betoning på vokalen med accent.",
    messageEn: "Put a little extra stress on the accented vowel.",
  },
  {
    id: "vowels",
    // Spanish vowels are always short and pure — useful tip whenever the
    // target contains vowels at all.
    test: (t) => /[aeiou]/i.test(t),
    messageSv: "Håll vokalerna korta och rena – inga svenska/engelska diftonger.",
    messageEn: "Keep vowels short and pure — no Swedish/English diphthongs.",
  },
  {
    id: "b_v",
    test: (t) => /[bv]/i.test(t),
    messageSv: '"b" och "v" låter nästan likadant – ett mjukt b-ljud.',
    messageEn: '"b" and "v" sound almost the same — a soft b-sound.',
  },
];

function detectTargetSounds(expectedText: string): string[] {
  return SOUND_PATTERNS.filter((p) => p.test(expectedText)).map((p) => p.id);
}

function buildSoundSuggestions(
  expectedText: string,
  level: Level,
  uiLang: "sv" | "en",
  closeWords: string[],
  missingWords: string[],
  maxCount: number,
): AssessmentSuggestion[] {
  const out: AssessmentSuggestion[] = [];
  const focusWord = closeWords[0] ?? missingWords[0];
  for (const p of SOUND_PATTERNS) {
    if (out.length >= maxCount) break;
    if (!p.test(expectedText)) continue;
    let message = uiLang === "sv" ? p.messageSv : p.messageEn;
    if (p.expandFromLevel && levelOrder(level) >= levelOrder(p.expandFromLevel)) {
      const extra = uiLang === "sv" ? p.expandSv : p.expandEn;
      if (extra) message += " " + extra;
    }
    out.push({ type: "sound", message, target: focusWord });
  }
  return out;
}

function levelOrder(l: Level): number {
  const order: Record<Level, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  return order[l] ?? 1;
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Run the assessment. Today this is the heuristic placeholder; tomorrow
 * this becomes a fetch to a real backend without changing the result shape.
 *
 * TODO(real-backend): when we have an audio assessment endpoint, pass the
 * raw audio blob here and replace the body with a `fetch` call.
 */
export async function assessPronunciation(
  input: AssessmentInput,
): Promise<AssessmentResult> {
  const { expectedText, transcript, level, uiLang } = input;
  const analysis = analyzePronunciation(expectedText, transcript);

  // Map summary -> simplified level
  const level3: AssessmentLevel =
    analysis.score >= 80
      ? "great"
      : analysis.score >= 60
        ? "good"
        : "needs_practice";

  const suggestions: AssessmentSuggestion[] = [];

  if (analysis.missingWords.length > 0) {
    suggestions.push({
      type: "missing_word",
      message:
        uiLang === "sv"
          ? `Du hoppade över: "${analysis.missingWords.slice(0, 3).join(", ")}". Försök få med alla ord.`
          : `You skipped: "${analysis.missingWords.slice(0, 3).join(", ")}". Try to include every word.`,
      target: analysis.missingWords[0],
    });
  }

  if (analysis.closeWords.length > 0) {
    suggestions.push({
      type: "clarity",
      message:
        uiLang === "sv"
          ? `"${analysis.closeWords.slice(0, 2).join(", ")}" var nästan rätt – uttala dem lite tydligare.`
          : `"${analysis.closeWords.slice(0, 2).join(", ")}" were close — say them a little more clearly.`,
      target: analysis.closeWords[0],
    });
  }

  if (analysis.extraWords.length > 0) {
    suggestions.push({
      type: "extra_word",
      message:
        uiLang === "sv"
          ? "Du la till extra ord. Försök följa frasen exakt."
          : "You added extra words. Try to follow the phrase exactly.",
    });
  }

  // Spanish-specific sound coaching, scaled by CEFR level.
  const remaining = Math.max(0, 4 - suggestions.length);
  if (analysis.score < 95 && remaining > 0) {
    suggestions.push(
      ...buildSoundSuggestions(
        expectedText,
        level,
        uiLang,
        analysis.closeWords,
        analysis.missingWords,
        remaining,
      ),
    );
  }

  // Rhythm / stress hints for higher levels.
  if (
    levelOrder(level) >= levelOrder("B1") &&
    analysis.score < 85 &&
    suggestions.length < 5
  ) {
    suggestions.push({
      type: "rhythm",
      message:
        uiLang === "sv"
          ? "Försök hålla en jämn rytm – spanska har korta, tydliga stavelser."
          : "Try to keep an even rhythm — Spanish has short, clear syllables.",
    });
  }

  // Adaptive: collect weak sounds based on which patterns the target hit
  // AND the user did not score perfectly on.
  const weakSounds = analysis.score < 80 ? detectTargetSounds(expectedText) : [];
  const weakWords = [...analysis.closeWords, ...analysis.missingWords];

  return {
    score: analysis.score,
    level: level3,
    transcript: transcript || undefined,
    expectedText,
    suggestions,
    retryRecommended: analysis.score < 80,
    source: "heuristic_placeholder",
    weakSounds,
    weakWords,
    analysis,
  };
}
