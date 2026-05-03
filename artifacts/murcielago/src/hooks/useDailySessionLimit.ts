import { useCallback, useEffect, useState } from "react";
import { dailySessionCounter } from "@/lib/learningCoachStores";
import { useFeatureAccess } from "./useFeatureAccess";

interface UseDailySessionLimitResult {
  /** Sessions started today (per local device clock). */
  count: number;
  /** Daily cap from the plan's feature access. `Infinity` for Premium. */
  limit: number;
  /** True when the user can still start another session today. */
  canStart: boolean;
  /** Increment + persist; returns the new count. */
  recordStart: () => Promise<number>;
  /** Refresh from storage (e.g. on day rollover or returning to tab). */
  refresh: () => Promise<void>;
}

/**
 * Reads + records the local "Today's Practice" counter and pairs it
 * with the plan's `dailySessionLimit`. Premium users' `canStart` is
 * always true.
 */
export function useDailySessionLimit(): UseDailySessionLimitResult {
  const { access, isPremium } = useFeatureAccess();
  const [count, setCount] = useState<number>(0);

  const refresh = useCallback(async () => {
    const c = await dailySessionCounter.getTodayCount();
    setCount(c);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordStart = useCallback(async () => {
    const c = await dailySessionCounter.recordSessionStarted();
    setCount(c);
    return c;
  }, []);

  return {
    count,
    limit: access.dailySessionLimit,
    canStart: isPremium || count < access.dailySessionLimit,
    recordStart,
    refresh,
  };
}
