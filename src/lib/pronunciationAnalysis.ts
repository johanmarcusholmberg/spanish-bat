import { normalizeAnswer } from "./answerUtils";

export interface WordAnalysis {
  target: string;           // original word from target
  spoken: string | null;    // what user said (null = skipped)
  status: "correct" | "close" | "wrong" | "skipped" | "extra";
}

export interface PronunciationAnalysis {
  score: number;            // 0-100
  wordResults: WordAnalysis[];
  summary: "perfect" | "great" | "good" | "needs_work" | "try_again";
  missingWords: string[];
  extraWords: string[];
  closeWords: string[];     // words that were close but not exact
}

/** Levenshtein distance */
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(a, b) / maxLen;
}

const CLOSE_THRESHOLD = 0.6;

export function analyzePronunciation(target: string, spoken: string): PronunciationAnalysis {
  const targetWords = normalizeAnswer(target).split(/\s+/).filter(Boolean);
  const spokenWords = normalizeAnswer(spoken).split(/\s+/).filter(Boolean);

  if (spokenWords.length === 0) {
    return {
      score: 0,
      wordResults: targetWords.map(w => ({ target: w, spoken: null, status: "skipped" })),
      summary: "try_again",
      missingWords: targetWords,
      extraWords: [],
      closeWords: [],
    };
  }

  // Use LCS-style alignment via dynamic programming
  const results: WordAnalysis[] = [];
  const missingWords: string[] = [];
  const extraWords: string[] = [];
  const closeWords: string[] = [];

  let ti = 0, si = 0;
  const matched = new Set<number>(); // spoken indices matched

  // Greedy alignment with look-ahead
  while (ti < targetWords.length) {
    const tw = targetWords[ti];
    let bestMatch = -1;
    let bestSim = 0;

    // Search within a window of spoken words
    const searchEnd = Math.min(spokenWords.length, si + targetWords.length + 2);
    for (let j = si; j < searchEnd; j++) {
      if (matched.has(j)) continue;
      const sim = similarity(tw, spokenWords[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestMatch = j;
      }
    }

    if (bestSim >= CLOSE_THRESHOLD && bestMatch >= 0) {
      // Mark any unmatched spoken words before this as extra
      for (let j = si; j < bestMatch; j++) {
        if (!matched.has(j)) {
          results.push({ target: "", spoken: spokenWords[j], status: "extra" });
          extraWords.push(spokenWords[j]);
          matched.add(j);
        }
      }
      matched.add(bestMatch);
      if (bestSim === 1) {
        results.push({ target: tw, spoken: spokenWords[bestMatch], status: "correct" });
      } else {
        results.push({ target: tw, spoken: spokenWords[bestMatch], status: "close" });
        closeWords.push(tw);
      }
      si = bestMatch + 1;
    } else {
      results.push({ target: tw, spoken: null, status: "skipped" });
      missingWords.push(tw);
    }
    ti++;
  }

  // Remaining spoken words are extra
  for (let j = si; j < spokenWords.length; j++) {
    if (!matched.has(j)) {
      results.push({ target: "", spoken: spokenWords[j], status: "extra" });
      extraWords.push(spokenWords[j]);
    }
  }

  // Calculate score
  const targetCount = targetWords.length;
  const correctCount = results.filter(r => r.status === "correct").length;
  const closeCount = results.filter(r => r.status === "close").length;
  const score = Math.round(((correctCount + closeCount * 0.5) / Math.max(targetCount, 1)) * 100);

  let summary: PronunciationAnalysis["summary"];
  if (score >= 95) summary = "perfect";
  else if (score >= 80) summary = "great";
  else if (score >= 60) summary = "good";
  else if (score >= 30) summary = "needs_work";
  else summary = "try_again";

  return { score, wordResults: results, summary, missingWords, extraWords, closeWords };
}

export interface PronunciationTip {
  sv: string;
  en: string;
}

export function getTips(analysis: PronunciationAnalysis, targetText: string): PronunciationTip[] {
  const tips: PronunciationTip[] = [];

  if (analysis.missingWords.length > 0) {
    tips.push({
      sv: `Du hoppade över: "${analysis.missingWords.slice(0, 3).join(", ")}". Försök att inkludera alla ord.`,
      en: `You skipped: "${analysis.missingWords.slice(0, 3).join(", ")}". Try to include all words.`,
    });
  }

  if (analysis.closeWords.length > 0) {
    tips.push({
      sv: `"${analysis.closeWords.slice(0, 2).join(", ")}" var nästan rätt. Lyssna noga och öva dessa ord separat.`,
      en: `"${analysis.closeWords.slice(0, 2).join(", ")}" were close. Listen carefully and practice these words separately.`,
    });
  }

  if (analysis.extraWords.length > 0) {
    tips.push({
      sv: "Du la till extra ord. Försök att följa texten exakt.",
      en: "You added extra words. Try to follow the text exactly.",
    });
  }

  // Phonetic tips based on common Spanish difficulties
  const lower = targetText.toLowerCase();
  if (analysis.score < 90) {
    if (lower.includes("rr") || /\br[aeiouáéíóú]/i.test(targetText)) {
      tips.push({ sv: "Öva det rullade 'r'-ljudet – vibrera tungspetsen.", en: "Practice the rolled 'r' sound — vibrate the tip of your tongue." });
    }
    if (/[áéíóú]/.test(targetText)) {
      tips.push({ sv: "Lägg extra betoning på betonade vokaler (á, é, í, ó, ú).", en: "Put extra stress on accented vowels (á, é, í, ó, ú)." });
    }
    if (lower.includes("ñ")) {
      tips.push({ sv: "Uttala 'ñ' som 'nj' i 'njuta'.", en: "Pronounce 'ñ' like 'ny' in 'canyon'." });
    }
  }

  if (analysis.summary === "needs_work" || analysis.summary === "try_again") {
    tips.push({ sv: "Tala lite långsammare och tydligare.", en: "Speak a bit slower and more clearly." });
  }

  return tips.slice(0, 4);
}

export function getEncouragement(summary: PronunciationAnalysis["summary"], lang: "sv" | "en"): string {
  const msgs: Record<PronunciationAnalysis["summary"], { sv: string; en: string }> = {
    perfect: { sv: "Perfekt uttal! Fantastiskt jobbat! 🎉", en: "Perfect pronunciation! Amazing work! 🎉" },
    great: { sv: "Utmärkt! Nästan perfekt! ⭐", en: "Excellent! Nearly perfect! ⭐" },
    good: { sv: "Bra jobbat! Du är på rätt väg! 💪", en: "Good job! You're on the right track! 💪" },
    needs_work: { sv: "Fortsätt öva – du blir bättre! 📚", en: "Keep practicing — you're improving! 📚" },
    try_again: { sv: "Lyssna noga och försök en gång till! 🔄", en: "Listen carefully and give it another try! 🔄" },
  };
  return msgs[summary][lang];
}
