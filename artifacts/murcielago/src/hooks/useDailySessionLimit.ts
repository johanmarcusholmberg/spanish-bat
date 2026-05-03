import { useCallback, useEffect, useState } from "react";
import { dailySessionCounter } from "@/lib/learningCoachStores";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useFeatureAccess } from "./useFeatureAccess";

interface UseDailySessionLimitResult {
  /** Sessions started today, max(local, server). */
  count: number;
  /** Daily cap from the plan's feature access. `Infinity` for Premium. */
  limit: number;
  /** True when the user can still start another session today. */
  canStart: boolean;
  /** Increment + persist locally and on the server; returns the new count. */
  recordStart: () => Promise<number>;
  /** Refresh from storage + server. */
  refresh: () => Promise<void>;
}

function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Reads + records the "Today's Practice" counter, mirroring it to the
 * server so the Free-tier cap survives uninstalls and device switches.
 * Server count is taken as max(local, server) so an offline session
 * still counts once the user comes back online.
 */
export function useDailySessionLimit(): UseDailySessionLimitResult {
  const { access, isPremium } = useFeatureAccess();
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? null;
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

  // Local-only optimistic bump. The authoritative server increment now
  // happens inside `/generate-practice-session` (called moments later
  // by the practice flow), so we deliberately do NOT POST to
  // `/daily-sessions/record` here — that would double-count.
  const recordStart = useCallback(async () => {
    const localCount = await dailySessionCounter.recordSessionStarted();
    setCount(localCount);
    return localCount;
  }, []);

  return {
    count,
    limit: access.dailySessionLimit,
    canStart: isPremium || count < access.dailySessionLimit,
    recordStart,
    refresh,
  };
}
