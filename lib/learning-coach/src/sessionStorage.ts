/**
 * Shared, framework-agnostic active-session persistence. Mobile binds this
 * to AsyncStorage; web binds it to localStorage. Same JSON envelope.
 */
import type { KvStorage } from "./kvStorage";

const ACTIVE_SESSION_KEY = "murci.activeSession.v1";

export interface SessionItemResult {
  itemId: string;
  picked: string | null;
  correct: boolean;
  skill?: string;
  subskill?: string;
  level?: string;
  recordedAt: number;
}

export interface ActiveSessionState {
  sessionId: string;
  mode: string;
  level: string;
  stepIndex: number;
  totalSteps: number;
  results: SessionItemResult[];
  appliedItemIds: string[];
  startedAt: number;
  updatedAt: number;
  label?: string;
}

export interface SessionStorageService {
  loadActiveSession(): Promise<ActiveSessionState | null>;
  saveSessionProgress(state: ActiveSessionState): Promise<void>;
  clearCompletedSession(): Promise<void>;
  newSession(opts: {
    sessionId: string;
    mode: string;
    level: string;
    totalSteps: number;
    label?: string;
  }): ActiveSessionState;
}

export function createSessionStorageService(kv: KvStorage): SessionStorageService {
  return {
    async loadActiveSession() {
      try {
        const raw = await kv.getItem(ACTIVE_SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ActiveSessionState;
        if (!parsed || typeof parsed.sessionId !== "string") return null;
        return parsed;
      } catch {
        return null;
      }
    },
    async saveSessionProgress(state) {
      const next: ActiveSessionState = { ...state, updatedAt: Date.now() };
      try {
        await kv.setItem(ACTIVE_SESSION_KEY, JSON.stringify(next));
      } catch {
        /* best effort */
      }
    },
    async clearCompletedSession() {
      try {
        await kv.removeItem(ACTIVE_SESSION_KEY);
      } catch {
        /* best effort */
      }
    },
    newSession(opts) {
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
}

export function isResumable(state: ActiveSessionState | null): boolean {
  if (!state) return false;
  if (state.totalSteps <= 0) return false;
  if (state.stepIndex >= state.totalSteps) return false;
  const ageMs = Date.now() - state.updatedAt;
  return ageMs < 24 * 60 * 60 * 1000;
}
