/**
 * Murciélingo AI Practice Generation
 * ----------------------------------
 * Pure (no-network) helpers for generating practice items via an LLM:
 *   - Types (`AIPracticeRequest`, `AIPracticeItem`, `AIPracticeResponse`).
 *   - `buildPracticePrompt` — strict prompt that asks the model for
 *     CEFR-appropriate Spanish practice as a JSON object.
 *   - `validateAIPracticeItems` — defensive validator that filters out
 *     malformed, off-level, off-language, duplicate, or unsafe items.
 *
 * This module never calls fetch / OpenAI itself; the api-server route
 * does that. Keeping it pure makes it trivially unit-testable and means
 * both the backend and (optionally) the clients can use it.
 */

import type { Level, SkillCategory } from "@workspace/practice";

export type PracticeMode =
  | "quick"
  | "weak_spots"
  | "level"
  | "review_previous"
  | "test_prep"
  | "challenge";

export type InterfaceLanguage = "en" | "sv";

export interface AIPracticeRequest {
  userLevel: Level;
  /** Topic / scenario hint, e.g. "restaurant", "travel", "greetings". */
  targetSkill?: string;
  /** Subskills the user has been weak on, e.g. "noun_gender". */
  weakSpots?: string[];
  /** How many items to generate (server clamps 1..15). */
  count?: number;
  interfaceLanguage?: InterfaceLanguage;
  /** Surface text of recent prompts the user got wrong, for context. */
  previousMistakes?: string[];
  /** Practice mode label, used to bias prompt style. */
  practiceMode?: PracticeMode;
  /** Existing prompts to avoid duplicating (lower-cased on the server). */
  avoidPrompts?: string[];
}

export interface AIPracticeItem {
  level: Level;
  skill: SkillCategory;
  /** Finer-grained category, e.g. "restaurant_phrases", "noun_gender". */
  subskill: string;
  /** Short instruction shown to the user (in interfaceLanguage). */
  prompt: string;
  /** The canonical Spanish answer. */
  expectedAnswer: string;
  /** Other acceptable Spanish phrasings. */
  acceptedAnswers?: string[];
  /** Short explanation in interfaceLanguage. */
  explanation?: string;
  /** 0..1 difficulty, calibrated to userLevel. */
  difficulty: number;
  source: "ai";
}

export interface AIPracticeResponse {
  items: AIPracticeItem[];
}

// ───────────────────────────────────────────────────────────────────
// Prompt
// ───────────────────────────────────────────────────────────────────

const VALID_SKILLS: ReadonlyArray<SkillCategory> = [
  "vocabulary",
  "grammar",
  "sentences",
  "reading",
  "listening",
  "speaking",
];

const VALID_LEVELS: ReadonlyArray<Level> = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export function buildPracticePrompt(req: AIPracticeRequest): {
  system: string;
  user: string;
} {
  const level = req.userLevel;
  const lang = req.interfaceLanguage ?? "en";
  const langName = lang === "sv" ? "Swedish" : "English";
  const count = Math.min(15, Math.max(1, req.count ?? 6));
  const skill = (req.targetSkill ?? "general daily-life conversation").trim();
  const weak = (req.weakSpots ?? []).slice(0, 6);
  const mistakes = (req.previousMistakes ?? []).slice(0, 6);
  const avoid = (req.avoidPrompts ?? []).slice(0, 20);
  const mode = req.practiceMode ?? "quick";

  const system = [
    "You are a Spanish language curriculum designer for the Murciélingo app.",
    "You generate short, realistic, CEFR-appropriate Spanish practice items.",
    "",
    "RULES:",
    "1. Output STRICT JSON ONLY. No prose, no markdown fences.",
    "2. Use vocabulary and grammar appropriate for the user's CEFR level.",
    "   - A1/A2: very common words, present tense bias, short prompts.",
    "   - B1/B2: everyday + some abstract vocab, broader tense use.",
    "   - C1/C2: nuance, idioms, complex grammar OK.",
    "3. The `prompt` field is the instruction shown to the learner — write it",
    `   in ${langName}. Keep it under 18 words. No translations inside.`,
    "4. The `expectedAnswer` MUST be in Spanish. Include 0–3 alternative",
    "   correct phrasings in `acceptedAnswers` when natural variants exist.",
    `5. The `,
    "   `explanation` is a short (≤ 25 words) note in",
    `   ${langName} explaining grammar or vocabulary. Optional but preferred.`,
    "6. Tag each item with a top-level CEFR `level`, a `skill`",
    `   from ${JSON.stringify(VALID_SKILLS)}, and a snake_case `,
    "   `subskill` (e.g. \"restaurant_phrases\", \"noun_gender\").",
    "7. `difficulty` is a number from 0 to 1, calibrated within the user's level.",
    "8. Avoid duplicate prompts within the response and avoid the prompts",
    "   listed in AVOID below.",
    "9. Prefer realistic travel, café, restaurant, shopping, greeting, work,",
    "   and daily-life situations. Avoid culturally strange or unsafe content.",
    "10. Do not include any personal data, profanity, slurs, sexual content,",
    "    violence, medical advice, or self-harm references.",
    "",
    "OUTPUT SHAPE (exactly this JSON object, no extra keys):",
    `{"items":[{"level":"A1","skill":"conversation","subskill":"restaurant_phrases","prompt":"Ask if they have a table for two.","expectedAnswer":"¿Tienen una mesa para dos?","acceptedAnswers":["¿Hay una mesa para dos?","Una mesa para dos, por favor."],"explanation":"Tienen means 'do you have' when speaking to staff.","difficulty":0.35,"source":"ai"}]}`,
    "Set `source` to the literal string \"ai\" on every item.",
  ].join("\n");

  const user = [
    `Generate ${count} Spanish practice items.`,
    `User CEFR level: ${level}`,
    `Practice mode: ${mode}`,
    `Topic / target skill: ${skill}`,
    weak.length ? `Focus on these weak subskills: ${weak.join(", ")}` : "",
    mistakes.length
      ? `User recently struggled with: ${mistakes.map((m) => `"${m}"`).join(", ")}`
      : "",
    avoid.length ? `AVOID these prompts (do NOT repeat): ${avoid.map((a) => `"${a}"`).join(", ")}` : "",
    `Interface language for prompts/explanations: ${langName}`,
    "",
    "Return STRICT JSON in the shape described above.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

// ───────────────────────────────────────────────────────────────────
// Validation
// ───────────────────────────────────────────────────────────────────

const UNSAFE_PATTERNS = [
  /\bkill\b/i,
  /\bsuicide\b/i,
  /\bsuicid/i,
  /\bporn/i,
  /\brape\b/i,
  /\bnigger/i,
  /\bfag\b/i,
  /\bfaggot/i,
  /\bcunt\b/i,
];

// Quick "is this Spanish?" heuristic — tolerant, not perfect.
const SPANISH_HINTS = [
  /[áéíóúñ¿¡]/i,
  /\b(el|la|los|las|un|una|de|que|y|no|en|por|con|para|es|está|están|tiene|tienen|hola|gracias|buenos|por favor|por qué|qué|dónde|cómo|cuándo|cuánto|hay|soy|eres|somos|son|me|te|se|nos|le|les|mi|tu|su|pero|sí|también)\b/i,
];

function looksLikeSpanish(s: string): boolean {
  if (!s || typeof s !== "string") return false;
  const trimmed = s.trim();
  if (trimmed.length < 2) return false;
  return SPANISH_HINTS.some((p) => p.test(trimmed));
}

function containsUnsafe(s: string): boolean {
  return UNSAFE_PATTERNS.some((p) => p.test(s));
}

const LEVEL_MAX_LEN: Record<Level, number> = {
  A1: 80,
  A2: 110,
  B1: 160,
  B2: 220,
  C1: 320,
  C2: 400,
};

function levelIdx(l: string): number {
  const idx = VALID_LEVELS.indexOf(l as Level);
  return idx === -1 ? -1 : idx;
}

function normalizePrompt(p: string): string {
  return p
    .toLowerCase()
    .replace(/[¿¡?!.,;:"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ValidationOptions {
  userLevel: Level;
  /** Pre-existing prompts (raw strings) to dedupe against. */
  avoidPrompts?: string[];
  /** Maximum levels above the user's current level we accept. Default 0. */
  maxLevelsAbove?: number;
}

export interface ValidationResult {
  items: AIPracticeItem[];
  rejected: { item: unknown; reason: string }[];
}

export { looksPersonal, normalizePromptForDedup } from "./personalFilter";

export function validateAIPracticeItems(
  raw: unknown,
  opts: ValidationOptions,
): ValidationResult {
  const out: AIPracticeItem[] = [];
  const rejected: { item: unknown; reason: string }[] = [];

  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === "object") {
    const r = raw as { items?: unknown };
    if (Array.isArray(r.items)) arr = r.items;
  }

  if (arr.length === 0) {
    return { items: out, rejected: [{ item: raw, reason: "JSON format is invalid" }] };
  }

  const userIdx = levelIdx(opts.userLevel);
  const maxAbove = opts.maxLevelsAbove ?? 0;
  const seen = new Set<string>(
    (opts.avoidPrompts ?? []).map((p) => normalizePrompt(String(p))),
  );

  for (const candidate of arr) {
    if (!candidate || typeof candidate !== "object") {
      rejected.push({ item: candidate, reason: "JSON format is invalid" });
      continue;
    }
    const c = candidate as Record<string, unknown>;

    const prompt = typeof c.prompt === "string" ? c.prompt.trim() : "";
    const expected = typeof c.expectedAnswer === "string" ? c.expectedAnswer.trim() : "";
    const lvl = typeof c.level === "string" ? c.level : "";
    const skill = typeof c.skill === "string" ? c.skill : "";
    const subskill =
      typeof c.subskill === "string" && c.subskill.trim()
        ? c.subskill.trim()
        : "general";
    const explanation =
      typeof c.explanation === "string" ? c.explanation.trim() : undefined;
    const acceptedRaw = Array.isArray(c.acceptedAnswers) ? c.acceptedAnswers : [];
    const accepted = acceptedRaw
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .slice(0, 6);
    const difficulty =
      typeof c.difficulty === "number" && Number.isFinite(c.difficulty)
        ? Math.min(1, Math.max(0, c.difficulty))
        : 0.5;

    if (!prompt) {
      rejected.push({ item: c, reason: "prompt is unclear" });
      continue;
    }
    if (!expected) {
      rejected.push({ item: c, reason: "missing expected answer" });
      continue;
    }
    const itemIdx = levelIdx(lvl);
    if (itemIdx === -1) {
      rejected.push({ item: c, reason: "invalid level" });
      continue;
    }
    if (userIdx !== -1 && itemIdx > userIdx + maxAbove) {
      rejected.push({ item: c, reason: "too difficult for selected level" });
      continue;
    }
    if (!VALID_SKILLS.includes(skill as SkillCategory)) {
      rejected.push({ item: c, reason: "invalid skill" });
      continue;
    }
    if (prompt.length > 220) {
      rejected.push({ item: c, reason: "prompt is unclear" });
      continue;
    }
    if (expected.length > LEVEL_MAX_LEN[lvl as Level]) {
      rejected.push({ item: c, reason: "too difficult for selected level" });
      continue;
    }
    if (!looksLikeSpanish(expected)) {
      rejected.push({ item: c, reason: "answer is not Spanish" });
      continue;
    }
    if (
      containsUnsafe(prompt) ||
      containsUnsafe(expected) ||
      (explanation && containsUnsafe(explanation))
    ) {
      rejected.push({ item: c, reason: "contains unsafe or inappropriate content" });
      continue;
    }
    const norm = normalizePrompt(prompt);
    if (seen.has(norm)) {
      rejected.push({ item: c, reason: "duplicate of existing item" });
      continue;
    }
    seen.add(norm);

    out.push({
      level: lvl as Level,
      skill: skill as SkillCategory,
      subskill,
      prompt,
      expectedAnswer: expected,
      acceptedAnswers: accepted.length ? accepted : undefined,
      explanation: explanation || undefined,
      difficulty,
      source: "ai",
    });
  }

  return { items: out, rejected };
}
