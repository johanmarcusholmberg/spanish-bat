/**
 * pronunciationStats
 *
 * Lightweight per-user persistence for pronunciation attempts. Today this is
 * localStorage-backed so we don't block on a backend migration; the API is
 * shaped so it can later be replaced with `api.pronunciation.recordAttempt(...)`
 * without touching the UI.
 *
 * Tracked:
 *  - last score per phrase id
 *  - retry count per phrase id
 *  - rolling list of weak sounds (most-frequent-first)
 *  - rolling list of weak words (most-frequent-first)
 *  - last overall score (for the dashboard / adaptive picker)
 */

const KEY_PREFIX = "murci.pronunciationStats.v1.";

export interface PhraseStat {
  lastScore: number;
  retryCount: number;
  attempts: number;
  lastAttemptAt: number;
}

export interface PronunciationStats {
  byPhrase: Record<string, PhraseStat>;
  weakSounds: Record<string, number>; // soundId -> count
  weakWords: Record<string, number>;  // word    -> count
  lastScore: number | null;
  totalAttempts: number;
}

export interface RecordedAttempt {
  phraseId: string;
  score: number;
  /** Set true when the user tried the SAME phrase again. */
  isRetry: boolean;
  weakSounds: string[];
  weakWords: string[];
}

const empty = (): PronunciationStats => ({
  byPhrase: {},
  weakSounds: {},
  weakWords: {},
  lastScore: null,
  totalAttempts: 0,
});

function storageKey(userId: string | null): string {
  return KEY_PREFIX + (userId ?? "anon");
}

export function loadPronunciationStats(userId: string | null): PronunciationStats {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

function save(userId: string | null, stats: PronunciationStats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(stats));
  } catch {
    // Quota / privacy mode — fail silently.
  }
}

export function recordPronunciationAttempt(
  userId: string | null,
  attempt: RecordedAttempt,
): PronunciationStats {
  const stats = loadPronunciationStats(userId);
  const prev = stats.byPhrase[attempt.phraseId];
  stats.byPhrase[attempt.phraseId] = {
    lastScore: attempt.score,
    retryCount: attempt.isRetry ? (prev?.retryCount ?? 0) + 1 : prev?.retryCount ?? 0,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAttemptAt: Date.now(),
  };
  for (const s of attempt.weakSounds) {
    stats.weakSounds[s] = (stats.weakSounds[s] ?? 0) + 1;
  }
  for (const w of attempt.weakWords) {
    stats.weakWords[w] = (stats.weakWords[w] ?? 0) + 1;
  }
  stats.lastScore = attempt.score;
  stats.totalAttempts += 1;
  save(userId, stats);
  return stats;
}

/** Sorted descending by frequency. Useful for the adaptive picker. */
export function topWeakSounds(stats: PronunciationStats, n = 3): string[] {
  return Object.entries(stats.weakSounds)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

export function topWeakWords(stats: PronunciationStats, n = 5): string[] {
  return Object.entries(stats.weakWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

/**
 * Decay weakness counters slightly. Call after a "great" attempt for a phrase
 * so the user is not punished forever for past struggles.
 */
export function decayWeakness(
  userId: string | null,
  weakSounds: string[],
  weakWords: string[],
): PronunciationStats {
  const stats = loadPronunciationStats(userId);
  for (const s of weakSounds) {
    if (stats.weakSounds[s]) {
      stats.weakSounds[s] = Math.max(0, stats.weakSounds[s] - 1);
      if (stats.weakSounds[s] === 0) delete stats.weakSounds[s];
    }
  }
  for (const w of weakWords) {
    if (stats.weakWords[w]) {
      stats.weakWords[w] = Math.max(0, stats.weakWords[w] - 1);
      if (stats.weakWords[w] === 0) delete stats.weakWords[w];
    }
  }
  save(userId, stats);
  return stats;
}
