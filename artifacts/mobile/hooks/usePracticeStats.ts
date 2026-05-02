import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  buildTodaysFocusMessage,
  detectWeakSpots,
  recordAttempt,
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

export interface UsePracticeStats {
  stats: UserPracticeStats;
  recordAttempt: (input: RecordAttemptInput) => void;
  weakSpots: WeakSpot[];
  todaysFocus: { en: string; sv: string };
  loaded: boolean;
  reset: () => void;
}

export function usePracticeStats(): UsePracticeStats {
  const { userId } = useAuth() as { userId?: string | null };
  const key = storageKey(userId);
  const [stats, setStats] = useState<UserPracticeStats>({});
  const [loaded, setLoaded] = useState(false);
  // Tracks whether the user has written to stats since the current key's load
  // started, so a late-arriving async load cannot clobber fresh updates.
  const dirtyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    dirtyRef.current = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled) return;
        // If the user already recorded an attempt while we were loading,
        // their in-memory stats are newer — don't overwrite them.
        if (!dirtyRef.current) {
          if (!raw) {
            setStats({});
          } else {
            try {
              const parsed = JSON.parse(raw) as UserPracticeStats;
              setStats(parsed && typeof parsed === "object" ? parsed : {});
            } catch {
              setStats({});
            }
          }
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          if (!dirtyRef.current) setStats({});
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const record = useCallback(
    (input: RecordAttemptInput) => {
      dirtyRef.current = true;
      setStats((prev) => {
        const next = recordAttempt(prev, input);
        AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    dirtyRef.current = true;
    setStats({});
    AsyncStorage.setItem(key, JSON.stringify({})).catch(() => {});
  }, [key]);

  const weakSpots = useMemo(() => detectWeakSpots(stats), [stats]);
  const todaysFocus = useMemo(
    () => buildTodaysFocusMessage(stats, { weakSpots }),
    [stats, weakSpots],
  );

  return { stats, recordAttempt: record, weakSpots, todaysFocus, loaded, reset };
}
