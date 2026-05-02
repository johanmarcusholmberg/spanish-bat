/**
 * Adapter that turns the various local content sources (quiz items,
 * grammar lessons, sentence builder) into a single flat stream of
 * `PracticeItem`s consumable by the shared `@workspace/practice` engine.
 *
 * Each item carries an opaque `payload` describing how to render and
 * grade it; the session runner switches on `payload.kind`.
 */

import {
  generatePracticeItems,
  type PracticeItem,
} from "@workspace/practice";
import type { Level } from "@/contexts/AuthContext";
import { quizItems } from "@/data/spanishData";
import { grammarLessons } from "@/data/grammarLessons";
import { sentenceExercises } from "@/data/sentenceBuilder";

export type PracticeSource = "curated" | "template" | "ai";

export type PracticePayload =
  | {
      kind: "translate";
      prompt: { sv: string; en: string };
      answer: string;
      acceptedAnswers?: string[];
      category: string;
      explanation?: { en: string; sv: string };
      source?: PracticeSource;
    }
  | {
      kind: "mcq";
      prompt: { es?: string; en: string; sv: string };
      options: string[];
      answer: string;
      explanation?: { en: string; sv: string };
      lessonId: string;
      source?: PracticeSource;
    }
  | {
      kind: "fill";
      prompt: { sv: string; en: string };
      sentence?: string;
      answer: string;
      hint?: { sv: string; en: string };
      lessonId: string;
      source?: PracticeSource;
    }
  | {
      kind: "sentence";
      correctOrder: string[];
      alternateOrders?: string[][];
      translation: { sv: string; en: string };
      grammarFocus?: string;
      source?: PracticeSource;
    };

/**
 * Convert an AI-generated practice item from the backend into a
 * `LocalPracticeItem` shaped payload the existing renderers understand.
 * AI items currently always render as the "translate" kind because the
 * backend produces free-form prompt + expected Spanish answer.
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

export function aiItemsToPracticeItems(
  raw: AIGeneratedItem[],
  interfaceLanguage: "en" | "sv",
): LocalPracticeItem[] {
  return raw.map((it, i) => {
    const promptText = it.prompt;
    const explanationText = it.explanation;
    return {
      id: `ai-${Date.now()}-${i}`,
      skill: (it.skill as LocalPracticeItem["skill"]) ?? "vocabulary",
      level: (it.level as Level) ?? "A1",
      category: it.subskill || "general",
      payload: {
        kind: "translate",
        prompt:
          interfaceLanguage === "sv"
            ? { sv: promptText, en: promptText }
            : { en: promptText, sv: promptText },
        answer: it.expectedAnswer,
        acceptedAnswers: it.acceptedAnswers,
        category: it.subskill || "general",
        explanation: explanationText
          ? interfaceLanguage === "sv"
            ? { sv: explanationText, en: explanationText }
            : { en: explanationText, sv: explanationText }
          : undefined,
        source: "ai",
      },
    };
  });
}

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
        source: "curated",
      },
    });
  }

  // Template-generated A1/A2 items — rule-based, runs locally, no AI.
  // Returned in the same `PracticeItem` shape as curated items so they
  // slot straight into `buildPracticeSession`.
  for (const g of generatePracticeItems({ upToLevel: "A2", maxPerTemplate: 8 })) {
    if (g.format === "mcq" && g.options) {
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
    } else if (g.format === "fill") {
      items.push({
        id: g.id,
        skill: g.skill,
        level: g.level as Level,
        category: g.category,
        difficulty: g.difficulty,
        payload: {
          kind: "fill",
          prompt: g.prompt,
          answer: g.answer,
          lessonId: g.templateId,
          source: "template",
        },
      });
    } else {
      items.push({
        id: g.id,
        skill: g.skill,
        level: g.level as Level,
        category: g.category,
        difficulty: g.difficulty,
        payload: {
          kind: "translate",
          prompt: g.prompt,
          answer: g.answer,
          acceptedAnswers: g.acceptedAnswers,
          category: g.category,
          source: "template",
        },
      });
    }
  }

  return items;
}
