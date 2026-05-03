import { useCallback, useEffect, useState } from "react";

import { dailySessionCounter } from "@/lib/dailySessionCounter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useFeatureAccess } from "./useFeatureAccess";

interface UseDailySessionLimitResult {
  count: number;
  limit: number;
  canStart: boolean;
  recordStart: () => Promise<number>;
  refresh: () => Promise<void>;
}

function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function tzOffsetMinutes(now = new Date()): number {
  return -now.getTimezoneOffset();
}

/**
 * Mobile twin of the web `useDailySessionLimit` hook. Syncs the local
 * AsyncStorage counter with the server so reinstalls and device
 * switches don't reset the Free-tier daily cap.
 */
export function useDailySessionLimit(): UseDailySessionLimitResult {
  const { access, isPremium } = useFeatureAccess();
  const { userId, loading: authLoading } = useAuth();
  const [count, setCount] = useState<number>(0);

  const refresh = useCallback(async () => {
    const local = await dailySessionCounter.getTodayCount();
    setCount(local);
    if (authLoading || !userId) return;
    try {
      const res = await api.dailySessions.get();
      const today = todayKey();
      if (res?.dailySession && res.dailySession.day === today) {
        const serverCount = res.dailySession.count;
        if (serverCount > local) setCount(serverCount);
      }
    } catch {
      /* offline / unauth — local is authoritative */
    }
  }, [authLoading, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordStart = useCallback(async () => {
    const localCount = await dailySessionCounter.recordSessionStarted();
    setCount(localCount);
    if (!authLoading && userId) {
      try {
        const res = await api.dailySessions.record({
          tzOffsetMinutes: tzOffsetMinutes(),
          localCount,
        });
        if (res?.dailySession?.count && res.dailySession.count > localCount) {
          setCount(res.dailySession.count);
          return res.dailySession.count;
        }
      } catch {
        /* offline — local count stands, will sync on next call */
      }
    }
    return localCount;
  }, [authLoading, userId]);

  return {
    count,
    limit: access.dailySessionLimit,
    canStart: isPremium || count < access.dailySessionLimit,
    recordStart,
    refresh,
  };
}
