/**
 * Adapter that turns the various local content sources (quiz items,
 * grammar lessons, sentence builder) into a single flat stream of
 * `PracticeItem`s consumable by the shared `@workspace/practice` engine.
 *
 * Each item carries an opaque `payload` describing how to render and
 * grade it; the session runner switches on `payload.kind`.
 */

import type { PracticeItem } from "@workspace/practice";
import type { Level } from "@/contexts/AuthContext";
import { quizItems } from "@/data/spanishData";
import { grammarLessons } from "@/data/grammarLessons";
import { sentenceExercises } from "@/data/sentenceBuilder";

export type PracticePayload =
  | {
      kind: "translate";
      prompt: { sv: string; en: string };
      answer: string;
      acceptedAnswers?: string[];
      category: string;
    }
  | {
      kind: "mcq";
      prompt: { es?: string; en: string; sv: string };
      options: string[];
      answer: string;
      explanation?: { en: string; sv: string };
      lessonId: string;
    }
  | {
      kind: "fill";
      prompt: { sv: string; en: string };
      sentence?: string;
      answer: string;
      hint?: { sv: string; en: string };
      lessonId: string;
    }
  | {
      kind: "sentence";
      correctOrder: string[];
      alternateOrders?: string[][];
      translation: { sv: string; en: string };
      grammarFocus?: string;
    };

export type LocalPracticeItem = PracticeItem<PracticePayload>;

export function buildAllPracticeItems(): LocalPracticeItem[] {
  const items: LocalPracticeItem[] = [];

  // Vocabulary / phrasebook quiz items → "translate"
  for (let i = 0; i < quizItems.length; i++) {
    const q = quizItems[i];
    items.push({
      id: `quiz-${q.category}-${i}`,
      skill: "vocabulary",
      level: q.level as Level,
      category: q.category,
      payload: {
        kind: "translate",
        prompt: q.question,
        answer: q.answer,
        acceptedAnswers: q.accepted_answers,
        category: q.category,
      },
    });
  }

  // Grammar lesson exercises → "mcq" or "fill"
  for (const lesson of grammarLessons) {
    for (let i = 0; i < lesson.exercises.length; i++) {
      const ex = lesson.exercises[i];
      const id = `gram-${lesson.id}-${i}`;
      if (ex.type === "multiple-choice" && ex.options) {
        items.push({
          id,
          skill: "grammar",
          level: lesson.level as Level,
          category: lesson.id,
          payload: {
            kind: "mcq",
            prompt: { en: ex.question.en, sv: ex.question.sv },
            options: ex.options,
            answer: ex.answer,
            lessonId: lesson.id,
          },
        });
      } else {
        items.push({
          id,
          skill: "grammar",
          level: lesson.level as Level,
          category: lesson.id,
          payload: {
            kind: "fill",
            prompt: ex.question,
            sentence: ex.prompt,
            answer: ex.answer,
            hint: ex.hint,
            lessonId: lesson.id,
          },
        });
      }
    }
  }

  // Sentence builder → "sentence"
  for (const s of sentenceExercises) {
    items.push({
      id: `sb-${s.id}`,
      skill: "sentences",
      level: s.level as Level,
      category: s.category,
      difficulty: s.difficulty,
      payload: {
        kind: "sentence",
        correctOrder: s.correctOrder,
        alternateOrders: s.alternateOrders,
        translation: s.translation,
        grammarFocus: s.grammarFocus,
      },
    });
  }

  return items;
}
