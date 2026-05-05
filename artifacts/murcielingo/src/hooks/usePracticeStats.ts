import { useCallback, useEffect, useMemo, useState } from "react";
import {
  detectWeakSpots,
  recordAttempt,
  buildTodaysFocusMessage,
  type RecordAttemptInput,
  type UserPracticeStats,
  type WeakSpot,
} from "@workspace/practice";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_PREFIX = "murci.practiceStats.v1.";
const ANON_KEY = "murci.practiceStats.v1.anon";

function storageKey(userId: string | null | undefined): string {
  return userId ? `${STORAGE_PREFIX}${userId}` : ANON_KEY;
}

function loadFromStorage(key: string): UserPracticeStats {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UserPracticeStats;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveToStorage(key: string, value: UserPracticeStats): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

export interface UsePracticeStats {
  stats: UserPracticeStats;
  recordAttempt: (input: RecordAttemptInput) => void;
  weakSpots: WeakSpot[];
  todaysFocus: { en: string; sv: string };
  reset: () => void;
}

export function usePracticeStats(): UsePracticeStats {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const key = storageKey(userId);
  const [stats, setStats] = useState<UserPracticeStats>(() => loadFromStorage(key));

  // Reload when the storage key changes (login/logout).
  useEffect(() => {
    setStats(loadFromStorage(key));
  }, [key]);

  const record = useCallback(
    (input: RecordAttemptInput) => {
      setStats((prev) => {
        const next = recordAttempt(prev, input);
        saveToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    setStats({});
    saveToStorage(key, {});
  }, [key]);

  const weakSpots = useMemo(() => detectWeakSpots(stats), [stats]);
  const todaysFocus = useMemo(
    () => buildTodaysFocusMessage(stats, { weakSpots }),
    [stats, weakSpots],
  );

  return { stats, recordAttempt: record, weakSpots, todaysFocus, reset };
}
