/**
 * Mistake Memory — shared, storage-agnostic store of recurring mistake
 * patterns. Callers pass a `MistakeStorage` adapter so the same code
 * works on web (`localStorage`) and React Native (`AsyncStorage`).
 *
 * All public APIs are async to keep web and mobile code paths identical.
 */

export type MistakeKind =
  | "wrong_article"
  | "wrong_gender"
  | "wrong_conjugation"
  | "spelling"
  | "confused_word"
  | "weak_listening"
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

export type StoredMistakeEvent = MistakeEvent &
  Required<Pick<MistakeEvent, "at">>;

export interface MistakeStore {
  /** Most recent first, capped to MAX_RECENT. */
  recent: StoredMistakeEvent[];
  /** Aggregate counts by mistake kind. */
  countsByKind: Partial<Record<MistakeKind, number>>;
  /** Aggregate counts by sub-skill ("ser_estar" → 4). */
  countsBySubskill: Record<string, number>;
}

/**
 * Storage adapter contract. Both methods may be sync or async — the
 * helpers always `await` the result so either works. The memory layer
 * never inspects values directly; it just round-trips JSON strings.
 */
export interface MistakeStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

const MAX_RECENT = 50;
const STORAGE_PREFIX = "murci.mistakeMemory.v1.";

export function emptyMistakeStore(): MistakeStore {
  return { recent: [], countsByKind: {}, countsBySubskill: {} };
}

function key(userId: string | null | undefined): string {
  return `${STORAGE_PREFIX}${userId ?? "anon"}`;
}

export async function loadMistakes(
  storage: MistakeStorage,
  userId: string | null | undefined,
): Promise<MistakeStore> {
  try {
    const raw = await storage.getItem(key(userId));
    if (!raw) return emptyMistakeStore();
    const parsed = JSON.parse(raw) as MistakeStore;
    if (!parsed || typeof parsed !== "object") return emptyMistakeStore();
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      countsByKind: parsed.countsByKind ?? {},
      countsBySubskill: parsed.countsBySubskill ?? {},
    };
  } catch {
    return emptyMistakeStore();
  }
}

export async function recordMistake(
  storage: MistakeStorage,
  userId: string | null | undefined,
  event: MistakeEvent,
): Promise<MistakeStore> {
  const store = await loadMistakes(storage, userId);
  const at = event.at ?? Date.now();
  const next: MistakeStore = {
    recent: [{ ...event, at }, ...store.recent].slice(0, MAX_RECENT),
    countsByKind: { ...store.countsByKind },
    countsBySubskill: { ...store.countsBySubskill },
  };
  next.countsByKind[event.kind] = (next.countsByKind[event.kind] ?? 0) + 1;
  if (event.subskill) {
    next.countsBySubskill[event.subskill] =
      (next.countsBySubskill[event.subskill] ?? 0) + 1;
  }
  try {
    await storage.setItem(key(userId), JSON.stringify(next));
  } catch {
    /* quota / write error — drop silently */
  }
  return next;
}

export async function clearMistakes(
  storage: MistakeStorage,
  userId: string | null | undefined,
): Promise<void> {
  try {
    await storage.removeItem(key(userId));
  } catch {
    /* ignore */
  }
}

export interface MistakePattern {
  kind: MistakeKind;
  subskill?: string;
  count: number;
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
  store: MistakeStore,
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

export function todaysMistakeFocus(
  store: MistakeStore,
  lang: "en" | "sv" = "en",
): string | null {
  const top = topMistakePatterns(store, 1)[0];
  if (!top || top.count < 2) return null;
  const label = top.label[lang];
  return lang === "sv"
    ? `Idag fokuserar vi lite extra på ${label.toLowerCase()}.`
    : `Today we'll spend a little extra time on ${label.toLowerCase()}.`;
}

// ── Built-in adapters ──────────────────────────────────────────────

/**
 * Adapter backed by the global `localStorage`. Returns a no-op store
 * when not running in a browser, so calling code never needs to guard
 * for SSR / native.
 */
export function localStorageAdapter(): MistakeStorage {
  const ls: Storage | undefined =
    typeof globalThis !== "undefined" &&
    (globalThis as { localStorage?: Storage }).localStorage
      ? (globalThis as { localStorage: Storage }).localStorage
      : undefined;
  if (!ls) {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return {
    getItem: (k) => ls.getItem(k),
    setItem: (k, v) => ls.setItem(k, v),
    removeItem: (k) => ls.removeItem(k),
  };
}
