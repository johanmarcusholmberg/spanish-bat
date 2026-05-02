/**
 * useResumableSession
 * -------------------
 * Read-only hook used by the Today screen and other surfaces that want to
 * show a "Continue today's practice" affordance. Mutations (start / save /
 * complete) are intentionally done via the service directly inside the
 * practice session screen so the writer owns the lifecycle.
 */
import { useCallback, useEffect, useState } from "react";
import {
  sessionStorageService,
  isResumable,
  type ActiveSessionState,
} from "@/lib/sessionStorageService";

export function useResumableSession() {
  const [active, setActive] = useState<ActiveSessionState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const state = await sessionStorageService.loadActiveSession();
    setActive(isResumable(state) ? state : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const clear = useCallback(async () => {
    await sessionStorageService.clearCompletedSession();
    setActive(null);
  }, []);

  return {
    activeSession: active,
    hasResumable: !!active,
    loading,
    refresh,
    clear,
  } as const;
}
