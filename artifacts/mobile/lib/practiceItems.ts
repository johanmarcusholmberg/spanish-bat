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
import { GRAMMAR_LESSONS, type Level } from "@/lib/mockContent";

export type MobilePracticePayload = {
  kind: "mcq";
  prompt: { es?: string; en: string; sv: string };
  options: string[];
  answer: string;
  explanation?: { en: string; sv: string };
  lessonId: string;
  source?: "curated" | "template";
};

export type MobilePracticeItem = PracticeItem<MobilePracticePayload>;

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
