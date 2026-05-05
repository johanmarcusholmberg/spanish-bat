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
 * Check user answer against multiple accepted answers.
 * Returns { correct, matchedAnswer } where matchedAnswer is the first match found.
 */
export function checkMultiAnswer(
  userAnswer: string,
  primaryAnswer: string,
  acceptedAnswers?: string[]
): { correct: boolean; matchedAnswer: string | null } {
  const norm = normalizeAnswer(userAnswer);
  if (norm === normalizeAnswer(primaryAnswer)) {
    return { correct: true, matchedAnswer: primaryAnswer };
  }
  if (acceptedAnswers) {
    for (const alt of acceptedAnswers) {
      if (norm === normalizeAnswer(alt)) {
        return { correct: true, matchedAnswer: alt };
      }
    }
  }
  return { correct: false, matchedAnswer: null };
}

/**
 * Soft reminders for formatting issues that should NOT mark the answer wrong.
 * Returns an array of reminder strings (empty if no reminders needed).
 */
export function getSoftReminders(
  userAnswer: string,
  correctAnswer: string,
  language: "sv" | "en"
): string[] {
  const reminders: string[] = [];
  const trimmed = userAnswer.trim();
  const correct = correctAnswer.trim();

  // Check for missing inverted question mark
  if (correct.includes("¿") && !trimmed.includes("¿")) {
    reminders.push(
      language === "sv"
        ? "Kom ihåg: spanska frågor börjar normalt med ¿"
        : "Remember: Spanish questions normally begin with ¿"
    );
  }

  // Check for missing inverted exclamation mark
  if (correct.includes("¡") && !trimmed.includes("¡")) {
    reminders.push(
      language === "sv"
        ? "Kom ihåg: spanska utrop börjar normalt med ¡"
        : "Remember: Spanish exclamations normally begin with ¡"
    );
  }

  // Check for missing accents (compare normalized versions)
  const accentChars = /[áéíóúñü]/gi;
  const correctAccents: string[] = correct.match(accentChars) || [];
  const userAccents: string[] = trimmed.match(accentChars) || [];
  if (correctAccents.length > 0 && userAccents.length < correctAccents.length) {
    // Find which accented chars are missing
    const missingAccents = correctAccents.filter(
      (c) => !userAccents.some((u) => u.toLowerCase() === c.toLowerCase())
    );
    if (missingAccents.length > 0) {
      const unique = [...new Set(missingAccents.map((c) => c.toLowerCase()))];
      reminders.push(
        language === "sv"
          ? `Kom ihåg accenter: ${unique.join(", ")}`
          : `Remember accents: ${unique.join(", ")}`
      );
    }
  }

  return reminders;
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
