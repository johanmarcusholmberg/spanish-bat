/**
 * Mobile adapter that turns local mock content (currently grammar
 * lesson MCQs) into `PracticeItem`s for the shared practice engine.
 * As more content sources land on mobile, extend this file.
 */
import type { PracticeItem } from "@workspace/practice";
import { GRAMMAR_LESSONS, type Level } from "@/lib/mockContent";

export type MobilePracticePayload = {
  kind: "mcq";
  prompt: { es?: string; en: string; sv: string };
  options: string[];
  answer: string;
  explanation?: { en: string; sv: string };
  lessonId: string;
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
        },
      });
    }
  }
  return items;
}
