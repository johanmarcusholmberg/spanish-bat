/**
 * sessionStorageService
 * ---------------------
 * Lightweight, framework-agnostic persistence for an *in-progress* guided
 * practice session so users can leave the app mid-session and resume without
 * losing answers, mistakes or weak-item updates.
 *
 * The shape is intentionally generic — it stores enough metadata to reconcile
 * a session with the items still available client-side, and the per-item
 * results so we never double-count progress on resume.
 *
 * Storage on mobile uses AsyncStorage; the same JSON envelope can later be
 * adopted by the web client via localStorage by swapping the adapter at the
 * top of this file (see TODO).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_SESSION_KEY = "murci.activeSession.v1";

// TODO(web/native shared): extract this into a tiny KV adapter so the same
// service can be re-used from `@workspace/learning-coach` and bound to either
// localStorage (web) or AsyncStorage (mobile). Today's mobile-only impl is
// fine because only the mobile session screen reads/writes it.
const kv = {
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      /* best effort */
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* best effort */
    }
  },
};

export interface SessionItemResult {
  /** Stable id of the practice item that was attempted. */
  itemId: string;
  /** What the user picked (free-form so it works for MCQ, build, echo, etc.). */
  picked: string | null;
  /** Whether the attempt was marked correct. */
  correct: boolean;
  /** Skill / subskill captured at attempt time so weak-spot updates are stable. */
  skill?: string;
  subskill?: string;
  level?: string;
  /** Epoch ms when the attempt was recorded. */
  recordedAt: number;
}

export interface ActiveSessionState {
  /** Stable session id — used to dedupe weak-spot/recordAttempt calls on resume. */
  sessionId: string;
  /** Practice mode (quick / weak_spots / vocabulary / etc.). */
  mode: string;
  /** User level the session was built for, e.g. "A1". */
  level: string;
  /** Current step index the user was on when last persisted. */
  stepIndex: number;
  /** Total number of items the session was built with. */
  totalSteps: number;
  /** Per-item results captured so far. */
  results: SessionItemResult[];
  /** Item ids whose weak-spot/SRS update has already been applied. */
  appliedItemIds: string[];
  /** Epoch ms — when the session was started. */
  startedAt: number;
  /** Epoch ms — last time we wrote the snapshot. */
  updatedAt: number;
  /** Optional human-readable hint for the Today resume card. */
  label?: string;
}

export const sessionStorageService = {
  async loadActiveSession(): Promise<ActiveSessionState | null> {
    const raw = await kv.get(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as ActiveSessionState;
      if (!parsed || typeof parsed.sessionId !== "string") return null;
      return parsed;
    } catch {
      return null;
    }
  },

  async saveSessionProgress(state: ActiveSessionState): Promise<void> {
    const next: ActiveSessionState = { ...state, updatedAt: Date.now() };
    await kv.set(ACTIVE_SESSION_KEY, JSON.stringify(next));
  },

  async clearCompletedSession(): Promise<void> {
    await kv.remove(ACTIVE_SESSION_KEY);
  },

  /** Build a fresh session envelope. */
  newSession(opts: {
    sessionId: string;
    mode: string;
    level: string;
    totalSteps: number;
    label?: string;
  }): ActiveSessionState {
    const now = Date.now();
    return {
      sessionId: opts.sessionId,
      mode: opts.mode,
      level: opts.level,
      stepIndex: 0,
      totalSteps: opts.totalSteps,
      results: [],
      appliedItemIds: [],
      startedAt: now,
      updatedAt: now,
      label: opts.label,
    };
  },
};

/** Heuristic: is this session worth resuming? */
export function isResumable(state: ActiveSessionState | null): boolean {
  if (!state) return false;
  if (state.totalSteps <= 0) return false;
  if (state.stepIndex >= state.totalSteps) return false;
  // Stale guard — drop sessions older than 24h so we don't surface
  // half-finished work from days ago.
  const ageMs = Date.now() - state.updatedAt;
  return ageMs < 24 * 60 * 60 * 1000;
}
