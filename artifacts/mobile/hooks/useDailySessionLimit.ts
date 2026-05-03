import { useCallback, useEffect, useState } from "react";

import { dailySessionCounter } from "@/lib/dailySessionCounter";
import { useFeatureAccess } from "./useFeatureAccess";

interface UseDailySessionLimitResult {
  count: number;
  limit: number;
  canStart: boolean;
  recordStart: () => Promise<number>;
  refresh: () => Promise<void>;
}

/**
 * Mobile twin of the web `useDailySessionLimit` hook. Backed by the
 * same shared `createDailySessionCounter` service.
 */
export function useDailySessionLimit(): UseDailySessionLimitResult {
  const { access, isPremium } = useFeatureAccess();
  const [count, setCount] = useState<number>(0);

  const refresh = useCallback(async () => {
    setCount(await dailySessionCounter.getTodayCount());
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
