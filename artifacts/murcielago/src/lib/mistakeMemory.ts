/**
 * Mistake Memory
 * --------------
 * Lightweight, local-first store of recurring mistake patterns. The goal
 * isn't perfect grammatical analysis — it's to give Today's Practice and
 * Practice Mixes a useful signal about what the learner keeps slipping on.
 *
 * Data is stored in localStorage (per user) so we don't change any backend
 * contracts. A future migration to the API can swap the storage layer
 * without touching call-sites because all access goes through the helpers
 * in this file.
 *
 * Not every exercise needs to report mistakes for v1 — even partial
 * coverage is enough to start surfacing patterns on Today.
 */

export type MistakeKind =
  | "wrong_article" // el / la / un / una mismatches
  | "wrong_gender"
  | "wrong_conjugation"
  | "spelling"
  | "confused_word" // false friends, near-homophones, etc.
  | "weak_listening" // user couldn't recognize from audio
  | "pronunciation"
  | "sentence_order"
  | "missing_accent"
  | "tense_mismatch"
  | "other";

export interface MistakeEvent {
  kind: MistakeKind;
  /** Stable id of the source item (word, sentence, lesson, etc.). */
  itemId?: string;
  /** Skill bucket the mistake belongs to ("vocabulary" / "grammar" / ...). */
  skill?: string;
  /** Free-form sub-skill ("ser_estar", "preterite", "gendered_nouns", ...). */
  subskill?: string;
  /** What the user typed / said. */
  userAnswer?: string;
  /** What the correct answer was. */
  correctAnswer?: string;
  /** ms timestamp (defaults to now). */
  at?: number;
}

export type StoredMistakeEvent = MistakeEvent & Required<Pick<MistakeEvent, "at">>;

export interface MistakeStore {
  /** Most recent first, capped to MAX_RECENT. */
  recent: StoredMistakeEvent[];
  /** Aggregate counts by mistake kind. */
  countsByKind: Partial<Record<MistakeKind, number>>;
  /** Aggregate counts by sub-skill ("ser_estar" → 4). */
  countsBySubskill: Record<string, number>;
}

const MAX_RECENT = 50;
const STORAGE_PREFIX = "murci.mistakeMemory.v1.";

type StoredShape = MistakeStore;

function emptyStore(): StoredShape {
  return { recent: [], countsByKind: {}, countsBySubskill: {} };
}

function key(userId: string | null | undefined): string {
  return `${STORAGE_PREFIX}${userId ?? "anon"}`;
}

export function loadMistakes(userId: string | null | undefined): StoredShape {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StoredShape;
    if (!parsed || typeof parsed !== "object") return emptyStore();
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      countsByKind: parsed.countsByKind ?? {},
      countsBySubskill: parsed.countsBySubskill ?? {},
    };
  } catch {
    return emptyStore();
  }
}

export function recordMistake(
  userId: string | null | undefined,
  event: MistakeEvent,
): StoredShape {
  const store = loadMistakes(userId);
  const at = event.at ?? Date.now();
  const next: StoredShape = {
    recent: [{ ...event, at }, ...store.recent].slice(0, MAX_RECENT),
    countsByKind: { ...store.countsByKind },
    countsBySubskill: { ...store.countsBySubskill },
  };
  next.countsByKind[event.kind] = (next.countsByKind[event.kind] ?? 0) + 1;
  if (event.subskill) {
    next.countsBySubskill[event.subskill] =
      (next.countsBySubskill[event.subskill] ?? 0) + 1;
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key(userId), JSON.stringify(next));
    } catch {
      /* quota — ignore */
    }
  }
  return next;
}

export function clearMistakes(userId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(userId));
  } catch {
    /* ignore */
  }
}

/**
 * Top recurring mistake patterns, biggest first. Used by Today's Practice
 * to suggest a focused mix ("you keep mixing up ser/estar — let's work on
 * that today").
 */
export interface MistakePattern {
  kind: MistakeKind;
  subskill?: string;
  count: number;
  /** Friendly label for the UI, EN/SV. */
  label: { en: string; sv: string };
}

const KIND_LABELS: Record<MistakeKind, { en: string; sv: string }> = {
  wrong_article: { en: "Articles (el / la)", sv: "Artiklar (el / la)" },
  wrong_gender: { en: "Word gender", sv: "Genus" },
  wrong_conjugation: { en: "Verb conjugation", sv: "Verbböjning" },
  spelling: { en: "Spelling", sv: "Stavning" },
  confused_word: { en: "Look-alike words", sv: "Förväxlade ord" },
  weak_listening: { en: "Listening", sv: "Hörförståelse" },
  pronunciation: { en: "Pronunciation", sv: "Uttal" },
  sentence_order: { en: "Word order", sv: "Ordföljd" },
  missing_accent: { en: "Accent marks", sv: "Accenttecken" },
  tense_mismatch: { en: "Verb tenses", sv: "Verbtempus" },
  other: { en: "Other", sv: "Övrigt" },
};

export function topMistakePatterns(
  store: StoredShape,
  max = 3,
): MistakePattern[] {
  const entries = Object.entries(store.countsByKind) as Array<
    [MistakeKind, number]
  >;
  return entries
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([kind, count]) => ({
      kind,
      count,
      label: KIND_LABELS[kind] ?? KIND_LABELS.other,
    }));
}

/**
 * Convert top patterns into a one-liner for Today's "focus" line. Returns
 * null when there isn't enough signal yet — never returns a misleading
 * empty placeholder.
 */
export function todaysMistakeFocus(
  store: StoredShape,
  lang: "en" | "sv" = "en",
): string | null {
  const top = topMistakePatterns(store, 1)[0];
  if (!top || top.count < 2) return null;
  const label = top.label[lang];
  return lang === "sv"
    ? `Idag fokuserar vi lite extra på ${label.toLowerCase()}.`
    : `Today we'll spend a little extra time on ${label.toLowerCase()}.`;
}
