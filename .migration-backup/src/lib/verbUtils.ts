import { Level } from "@/contexts/AuthContext";

/**
 * Maps CEFR levels to the tenses available at that level (cumulative).
 */
export const tenseLevelMap: Record<string, Level> = {
  presente: "A1",
  "ir_a_infinitivo": "A1",
  preterito: "A2",
  imperfecto: "A2",
  perfecto: "B1",
  futuro: "B1",
  condicional: "B1",
  subjuntivo: "B2",
  imperativo: "B2",
  pluscuamperfecto: "C1",
  subjuntivo_perfecto: "C1",
  subjuntivo_imperfecto: "C2",
};

const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Returns tenses the user has unlocked at their level */
export function getTensesForLevel(userLevel: Level): string[] {
  const maxIdx = LEVEL_ORDER.indexOf(userLevel);
  return Object.entries(tenseLevelMap)
    .filter(([, lvl]) => LEVEL_ORDER.indexOf(lvl) <= maxIdx)
    .map(([tense]) => tense);
}

/** Filter a verb's available tenses to those the user has unlocked */
export function filterVerbTenses(
  verbTenses: Record<string, any>,
  userLevel: Level
): string[] {
  const unlocked = getTensesForLevel(userLevel);
  return Object.keys(verbTenses).filter((t) => unlocked.includes(t));
}

/** Tense explanation data */
export const tenseExplanations: Record<string, { sv: string; en: string; usage_sv: string; usage_en: string }> = {
  presente: {
    sv: "Presens",
    en: "Present tense",
    usage_sv: "Beskriver handlingar som sker nu eller är vanliga/återkommande.",
    usage_en: "Describes actions happening now or habitual/recurring actions.",
  },
  preterito: {
    sv: "Preteritum (indefinido)",
    en: "Preterite",
    usage_sv: "Beskriver avslutade handlingar i det förflutna med en tydlig tidpunkt.",
    usage_en: "Describes completed actions in the past with a clear time frame.",
  },
  imperfecto: {
    sv: "Imperfekt",
    en: "Imperfect",
    usage_sv: "Beskriver pågående eller vanemässiga handlingar i det förflutna.",
    usage_en: "Describes ongoing or habitual actions in the past.",
  },
  perfecto: {
    sv: "Perfekt (pretérito perfecto)",
    en: "Present perfect",
    usage_sv: "Beskriver handlingar som nyligen avslutats eller har koppling till nuet.",
    usage_en: "Describes recently completed actions or actions connected to the present.",
  },
  futuro: {
    sv: "Futurum (futuro simple)",
    en: "Future simple",
    usage_sv: "Beskriver handlingar som kommer att ske i framtiden.",
    usage_en: "Describes actions that will happen in the future.",
  },
  condicional: {
    sv: "Konditionalis",
    en: "Conditional",
    usage_sv: "Uttrycker hypotetiska situationer eller artiga förfrågningar.",
    usage_en: "Expresses hypothetical situations or polite requests.",
  },
  subjuntivo: {
    sv: "Konjunktiv presens",
    en: "Present subjunctive",
    usage_sv: "Uttrycker önskningar, tvivel, känslor eller osäkra situationer.",
    usage_en: "Expresses wishes, doubts, emotions, or uncertain situations.",
  },
  imperativo: {
    sv: "Imperativ",
    en: "Imperative",
    usage_sv: "Ger kommandon, uppmaningar eller instruktioner.",
    usage_en: "Gives commands, requests, or instructions.",
  },
  pluscuamperfecto: {
    sv: "Pluskvamperfekt",
    en: "Past perfect (pluperfect)",
    usage_sv: "Beskriver handlingar som hade avslutats före en annan händelse i det förflutna.",
    usage_en: "Describes actions that had been completed before another past event.",
  },
};

/** AR/ER/IR verb pattern detection */
export type VerbPattern = "-ar" | "-er" | "-ir" | "irregular";

export function getVerbPattern(infinitive: string): VerbPattern {
  if (infinitive.endsWith("ar")) return "-ar";
  if (infinitive.endsWith("er")) return "-er";
  if (infinitive.endsWith("ir")) return "-ir";
  return "irregular";
}

/** Split a conjugated verb into stem + ending for visual highlighting */
export function splitVerbEnding(
  conjugated: string,
  infinitive: string
): { stem: string; ending: string } | null {
  // compound tenses (e.g. "he hablado") — skip splitting
  if (conjugated.includes(" ")) return null;

  const root = infinitive.slice(0, -2); // remove -ar/-er/-ir
  // try to find root inside conjugated form
  if (conjugated.toLowerCase().startsWith(root.toLowerCase())) {
    return {
      stem: conjugated.slice(0, root.length),
      ending: conjugated.slice(root.length),
    };
  }
  // irregular — just return whole word
  return null;
}

/** Generate smart error feedback comparing user answer vs correct answer */
export function getSmartFeedback(
  userAnswer: string,
  correctAnswer: string,
  selectedTense: string,
  language: "sv" | "en"
): string | null {
  if (!userAnswer.trim()) return null;
  const ua = userAnswer.trim().toLowerCase();
  const ca = correctAnswer.trim().toLowerCase();
  if (ua === ca) return null;

  // Check if user used a different tense's conjugation
  // We can detect common patterns
  const explanationCorrect = tenseExplanations[selectedTense];
  if (!explanationCorrect) return null;

  if (language === "sv") {
    return `Du svarade "${userAnswer}". Rätt svar är "${correctAnswer}" (${explanationCorrect.sv}). ${explanationCorrect.usage_sv}`;
  }
  return `You answered "${userAnswer}". The correct answer is "${correctAnswer}" (${explanationCorrect.en}). ${explanationCorrect.usage_en}`;
}

/** Check if user has studied a tense via grammar lessons */
export function getGrammarLessonForTense(tense: string): string | null {
  const tenseToLesson: Record<string, string> = {
    presente: "present-tense-regular",
    preterito: "preterite-tense",
    imperfecto: "imperfect-tense",
    perfecto: "present-perfect",
    futuro: "future-tense",
    condicional: "conditional",
    subjuntivo: "subjunctive-present",
  };
  return tenseToLesson[tense] || null;
}
