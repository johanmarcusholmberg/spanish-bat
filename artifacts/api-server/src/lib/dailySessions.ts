/**
 * Shared helper for the per-user daily-session counter. Centralises the
 * "what day is it for this user" rule so `/generate-practice-session`
 * (the authoritative incrementer) and `/daily-sessions/record` (the
 * offline catch-up sync) agree.
 */

/**
 * Compute YYYY-MM-DD for a user given their reported timezone offset
 * in minutes east of UTC (matching `-Date.prototype.getTimezoneOffset()`).
 * Clamped to ±14h to bound abuse: even at the extremes the user can
 * only "skip" forward by ~28h once.
 */
export function deriveDay(tzOffsetMinutes: number, now: Date = new Date()): string {
  const clamped = Math.max(-14 * 60, Math.min(14 * 60, tzOffsetMinutes));
  const shifted = new Date(now.getTime() + clamped * 60_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseTzOffset(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.trunc(value);
}
