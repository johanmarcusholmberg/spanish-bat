/**
 * Mobile adapter that turns local content sources into `PracticeItem`s
 * for the shared practice engine. Today this is:
 *   1. Curated grammar lesson MCQs (`GRAMMAR_LESSONS`).
 *   2. MCQ-format items produced by the shared template generator
 *      (`generatePracticeItems`) — rule-based, runs locally, no AI.
 */
import {
  generatePracticeItems,
  type PracticeItem,
} from "@workspace/practice";
import { GRAMMAR_LESSONS, type Level } from "@workspace/learning-content";

export type MobilePracticeSource = "curated" | "template" | "ai";

export type MobilePracticePayload = {
  kind: "mcq";
  prompt: { es?: string; en: string; sv: string };
  options: string[];
  answer: string;
  explanation?: { en: string; sv: string };
  lessonId: string;
  source?: MobilePracticeSource;
};

export type MobilePracticeItem = PracticeItem<MobilePracticePayload>;

/**
 * Convert AI-generated items (free-form prompt + Spanish answer) into the
 * MCQ payload mobile uses today by synthesizing distractor options from
 * other AI items in the same batch. If we can't build distractors we drop
 * the item — better than rendering a half-broken question.
 */
export interface AIGeneratedItem {
  level: string;
  skill: string;
  subskill: string;
  prompt: string;
  expectedAnswer: string;
  acceptedAnswers?: string[];
  explanation?: string;
  difficulty: number;
}

// Generic Spanish fallback distractors for tiny AI batches where we
// can't synthesize enough options from the batch itself. Common, short,
// CEFR-appropriate phrases that won't accidentally match real answers.
const FALLBACK_DISTRACTORS = [
  "No lo sé.",
  "Tal vez mañana.",
  "Está bien.",
  "Hasta luego.",
  "De nada.",
  "Por favor.",
];

export function aiItemsToPracticeItems(
  raw: AIGeneratedItem[],
  interfaceLanguage: "en" | "sv",
): MobilePracticeItem[] {
  const answers = raw.map((r) => r.expectedAnswer).filter(Boolean);
  const out: MobilePracticeItem[] = [];
  raw.forEach((it, i) => {
    const fromBatch = answers
      .filter((a) => a !== it.expectedAnswer)
      .slice(0, 3);
    const fallback = FALLBACK_DISTRACTORS.filter(
      (d) => d !== it.expectedAnswer,
    );
    const distractors = [...fromBatch];
    for (const f of fallback) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(f)) distractors.push(f);
    }
    if (distractors.length < 2) return;
    const opts = [it.expectedAnswer, ...distractors.slice(0, 3)];
    // Light shuffle.
    for (let j = opts.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [opts[j], opts[k]] = [opts[k], opts[j]];
    }
    out.push({
      id: `ai-${Date.now()}-${i}`,
      skill: (it.skill as MobilePracticeItem["skill"]) ?? "vocabulary",
      level: (it.level as Level) ?? "A1",
      category: it.subskill || "general",
      payload: {
        kind: "mcq",
        prompt:
          interfaceLanguage === "sv"
            ? { sv: it.prompt, en: it.prompt }
            : { en: it.prompt, sv: it.prompt },
        options: opts,
        answer: it.expectedAnswer,
        explanation: it.explanation
          ? interfaceLanguage === "sv"
            ? { sv: it.explanation, en: it.explanation }
            : { en: it.explanation, sv: it.explanation }
          : undefined,
        lessonId: `ai-${it.subskill}`,
        source: "ai",
      },
    });
  });
  return out;
}

export function buildAllPracticeItems(): MobilePracticeItem[] {
  const items: MobilePracticeItem[] = [];

  for (const lesson of GRAMMAR_LESSONS) {
    for (const q of lesson.questions) {
      items.push({
        id: `gram-${lesson.id}-${q.id}`,
        skill: "grammar",
        level: lesson.level as Level,
        category: lesson.id,
        payload: {
          kind: "mcq",
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          lessonId: lesson.id,
          source: "curated",
        },
      });
    }
  }

  // Template-generated MCQ items (noun gender, indefinite article, …).
  // Rendered with the same MCQ component as curated questions.
  for (const g of generatePracticeItems({ upToLevel: "A2", maxPerTemplate: 8 })) {
    if (g.format !== "mcq" || !g.options) continue;
    items.push({
      id: g.id,
      skill: g.skill,
      level: g.level as Level,
      category: g.category,
      difficulty: g.difficulty,
      payload: {
        kind: "mcq",
        prompt: { en: g.prompt.en, sv: g.prompt.sv },
        options: g.options,
        answer: g.answer,
        explanation: g.explanation,
        lessonId: g.templateId,
        source: "template",
      },
    });
  }

  return items;
}
