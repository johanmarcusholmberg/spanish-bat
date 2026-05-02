/**
 * Detects whether a generated practice item references user-specific
 * personal data and should NOT be saved to the shared library. Used to
 * keep the persisted item pool generic and reusable.
 *
 * Heuristics — conservative on purpose. False positives just mean we
 * don't save the item; the user still sees it in their session.
 */

const PERSONAL_PATTERNS: ReadonlyArray<RegExp> = [
  // Contact details
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b\+?\d[\d\s().-]{7,}\d\b/,
  /\bhttps?:\/\/\S+/i,
  // First-person identity statements (en)
  /\bmy name is\b/i,
  /\bi(?:'m| am)\s+(?:called|named)\b/i,
  /\bi live in\b/i,
  /\bmy (?:address|phone|email|password|birthday|son|daughter|wife|husband|boss|teacher)\b/i,
  // First-person identity statements (es)
  /\bme llamo\b/i,
  /\bmi nombre es\b/i,
  /\bvivo en\b/i,
  /\bmi (?:dirección|teléfono|correo|contraseña|cumpleaños|jefe|maestro|esposa|esposo)\b/i,
  // First-person identity statements (sv)
  /\bjag heter\b/i,
  /\bmitt namn är\b/i,
  /\bjag bor i\b/i,
  /\bmin (?:adress|telefon|e-post|lösenord|födelsedag)\b/i,
];

/**
 * Returns true if the text looks user-specific and shouldn't be saved
 * to the shared practice library.
 */
export function looksPersonal(...texts: Array<string | undefined>): boolean {
  for (const t of texts) {
    if (!t) continue;
    for (const re of PERSONAL_PATTERNS) {
      if (re.test(t)) return true;
    }
  }
  return false;
}

/**
 * Stable normalisation used both for dedup and for `avoidPrompts`. Must
 * stay in sync with `validateAIPracticeItems`'s `normalizePrompt`.
 */
export function normalizePromptForDedup(p: string): string {
  return p
    .toLowerCase()
    .replace(/[¿¡?!.,;:"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
