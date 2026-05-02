// Lightweight SM-2-style spaced repetition helper used by the
// Flashcards screen. Mirrors the web app's behaviour at a high level
// without trying to be a faithful 1:1 port.

export type SrsRating = "again" | "hard" | "good" | "easy";

export interface SrsState {
  reviewState: "new" | "learning" | "review";
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  nextReview: string; // ISO date
}

export function defaultSrsState(): SrsState {
  return {
    reviewState: "new",
    intervalDays: 0,
    easeFactor: 2.5,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    nextReview: new Date().toISOString(),
  };
}

export function applyRating(state: SrsState, rating: SrsRating): SrsState {
  const correct = rating !== "again";
  const reviewCount = state.reviewCount + 1;
  let intervalDays = state.intervalDays;
  let easeFactor = state.easeFactor;
  let reviewState = state.reviewState;

  switch (rating) {
    case "again":
      intervalDays = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      reviewState = "learning";
      break;
    case "hard":
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      reviewState = intervalDays >= 1 ? "review" : "learning";
      break;
    case "good":
      intervalDays = intervalDays === 0 ? 1 : Math.round(intervalDays * easeFactor);
      reviewState = "review";
      break;
    case "easy":
      intervalDays = intervalDays === 0 ? 4 : Math.round(intervalDays * easeFactor * 1.3);
      easeFactor = easeFactor + 0.15;
      reviewState = "review";
      break;
  }

  const next = new Date();
  next.setDate(next.getDate() + intervalDays);

  return {
    reviewState,
    intervalDays,
    easeFactor,
    reviewCount,
    correctCount: state.correctCount + (correct ? 1 : 0),
    incorrectCount: state.incorrectCount + (correct ? 0 : 1),
    nextReview: next.toISOString(),
  };
}

export function isDue(state: SrsState, now = new Date()): boolean {
  if (state.reviewState === "new") return true;
  return new Date(state.nextReview).getTime() <= now.getTime();
}
