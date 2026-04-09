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

/**
 * Check a noun answer. Accepts the noun alone OR article+noun.
 * If the user typed the full form with article, we check that too and
 * return whether the gender was proven correct by the typed answer.
 */
export function checkNounAnswer(
  userAnswer: string,
  expectedNoun: string,
  expectedArticle: "el" | "la",
  expectedPlural?: string
): { nounCorrect: boolean; genderProvenByTyping: boolean } {
  const norm = normalizeAnswer(userAnswer);
  const nounNorm = normalizeAnswer(expectedNoun);
  const fullSingular = normalizeAnswer(`${expectedArticle} ${expectedNoun}`);
  const pluralArticle = expectedArticle === "el" ? "los" : "las";
  const fullPlural = expectedPlural ? normalizeAnswer(`${pluralArticle} ${expectedPlural}`) : "";
  const pluralNorm = expectedPlural ? normalizeAnswer(expectedPlural) : "";

  // Exact noun match
  if (norm === nounNorm) {
    return { nounCorrect: true, genderProvenByTyping: false };
  }
  // Full article + noun match
  if (norm === fullSingular) {
    return { nounCorrect: true, genderProvenByTyping: true };
  }
  // Plural form accepted
  if (pluralNorm && (norm === pluralNorm || norm === fullPlural)) {
    return { nounCorrect: true, genderProvenByTyping: norm === fullPlural };
  }
  return { nounCorrect: false, genderProvenByTyping: false };
}
