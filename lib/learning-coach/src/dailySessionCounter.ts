/**
 * Local daily-session counter used by the Free plan to enforce
 * "1 Today's Practice per day". Lives in the shared learning-coach
 * package so both the web (localStorage) and mobile (AsyncStorage)
 * clients use the same JSON envelope.
 *
 * Day boundaries are based on the device's local YYYY-MM-DD; we never
 * round-trip this through the API server because the limit is a UX
 * nudge rather than a security boundary — Premium is the only thing
 * that should ever be enforced server-side, and it is.
 *
 * If the user changes their device clock backward, they can replay an
 * extra free session. Acceptable trade-off for a free-tier soft cap.
 */
import type { KvStorage } from "./kvStorage";

const DAILY_SESSION_KEY = "murci.dailySessionCount.v1";

interface DailySessionEnvelope {
  /** YYYY-MM-DD in the user's local timezone. */
  day: string;
  /** Sessions started on `day`. */
  count: number;
}

function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DailySessionCounterService {
  /** Read today's count, resetting transparently when the day rolls over. */
  getTodayCount(): Promise<number>;
  /** Increment today's count and return the new value. */
  recordSessionStarted(): Promise<number>;
  /** Force-reset to zero (manual debug / "new day" override). */
  reset(): Promise<void>;
}

export function createDailySessionCounter(
  kv: KvStorage,
): DailySessionCounterService {
  async function readEnvelope(): Promise<DailySessionEnvelope> {
    const today = todayKey();
    try {
      const raw = await kv.getItem(DAILY_SESSION_KEY);
      if (!raw) return { day: today, count: 0 };
      const parsed = JSON.parse(raw) as DailySessionEnvelope;
      if (!parsed || parsed.day !== today) return { day: today, count: 0 };
      return { day: today, count: Math.max(0, parsed.count | 0) };
    } catch {
      return { day: today, count: 0 };
    }
  }

  async function writeEnvelope(env: DailySessionEnvelope): Promise<void> {
    try {
      await kv.setItem(DAILY_SESSION_KEY, JSON.stringify(env));
    } catch {
      /* best effort */
    }
  }

  return {
    async getTodayCount() {
      const env = await readEnvelope();
      return env.count;
    },
    async recordSessionStarted() {
      const env = await readEnvelope();
      const next: DailySessionEnvelope = {
        day: env.day,
        count: env.count + 1,
      };
      await writeEnvelope(next);
      return next.count;
    },
    async reset() {
      await writeEnvelope({ day: todayKey(), count: 0 });
    },
  };
}
