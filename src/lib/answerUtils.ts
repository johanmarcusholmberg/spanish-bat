/**
 * Normalize a string for comparison: lowercase, strip punctuation (¡¿!?.,:;), trim whitespace.
 * This allows lenient comparison while still showing the correct form to the user.
 */
export function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[¡¿!?.,;:()"""''«»\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compare user answer to correct answer, ignoring case and punctuation.
 */
export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
