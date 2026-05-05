import { useState, useMemo, useCallback } from "react";
import { nouns, getItemsForLevel, NounData } from "@/data/spanishData";
import { Level } from "@/contexts/AuthContext";

export type EchoStep = "recognition" | "speaking" | "context" | "production";

export interface EchoWord {
  noun: NounData;
  /** Fill-in-the-blank: sentence with ___ and the answer word */
  contextSentence: string;
  contextAnswer: string;
  /** Full sentence translation for production step */
  productionPrompt: { sv: string; en: string };
  productionAnswer: string;
}

const ECHO_STEPS: EchoStep[] = ["recognition", "speaking", "context", "production"];

/** Build a context challenge from a noun's example sentence */
function buildContext(noun: NounData): { sentence: string; answer: string } {
  const es = noun.example.es;
  // Replace the Spanish word (case-insensitive) with ___
  const regex = new RegExp(`\\b${noun.spanish}\\b`, "i");
  if (regex.test(es)) {
    return { sentence: es.replace(regex, "___"), answer: noun.spanish };
  }
  // Fallback: simple pattern
  return {
    sentence: `${noun.gender === "el" ? "El" : "La"} ___ es importante.`,
    answer: noun.spanish,
  };
}

function buildProduction(noun: NounData): { prompt: { sv: string; en: string }; answer: string } {
  return {
    prompt: { sv: noun.example.sv, en: noun.example.en },
    answer: noun.example.es,
  };
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useEchoLoop = (userLevel: Level, language: "sv" | "en") => {
  const sessionWords = useMemo(() => {
    const available = getItemsForLevel(nouns, userLevel);
    const shuffled = shuffle(available);
    // Pick 5 words per session (with micro-spaced repetition: repeat first word at end)
    const picked = shuffled.slice(0, Math.min(5, shuffled.length));
    const echoWords: EchoWord[] = picked.map((noun) => {
      const ctx = buildContext(noun);
      const prod = buildProduction(noun);
      return {
        noun,
        contextSentence: ctx.sentence,
        contextAnswer: ctx.answer,
        productionPrompt: prod.prompt,
        productionAnswer: prod.answer,
      };
    });
    // Micro spaced repetition: re-add the first word at the end for reinforcement
    if (echoWords.length >= 3) {
      echoWords.push({ ...echoWords[0] });
    }
    return echoWords;
  }, [userLevel]);

  const [wordIndex, setWordIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  const currentWord = sessionWords[wordIndex] || null;
  const currentStep = ECHO_STEPS[stepIndex];
  const totalWords = sessionWords.length;
  const echoNumber = stepIndex + 1;
  const totalEchos = ECHO_STEPS.length;

  const advanceStep = useCallback(() => {
    if (stepIndex < ECHO_STEPS.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      // Word complete, go to next word
      const nextWord = wordIndex + 1;
      setWordsCompleted((w) => w + 1);
      if (nextWord >= sessionWords.length) {
        setCompleted(true);
      } else {
        setWordIndex(nextWord);
        setStepIndex(0);
      }
    }
  }, [stepIndex, wordIndex, sessionWords.length]);

  const resetSession = useCallback(() => {
    setWordIndex(0);
    setStepIndex(0);
    setCompleted(false);
    setWordsCompleted(0);
  }, []);

  return {
    currentWord,
    currentStep,
    echoNumber,
    totalEchos,
    wordIndex,
    totalWords,
    wordsCompleted,
    completed,
    advanceStep,
    resetSession,
    sessionWords,
  };
};
