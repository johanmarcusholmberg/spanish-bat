import { useEffect, useMemo, useRef, useState } from "react";
import {
  countDueItems,
  friendlySubskillName,
  type WeakSpot,
  type UserPracticeStats,
} from "@workspace/practice";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export interface EchoMemorySummary {
  hasData: boolean;
  weakCount: number;
  dueCount: number;
  improvedCount: number;
  trackedCount: number;
  topFocus: { en: string; sv: string } | null;
  topImproved: { en: string; sv: string } | null;
}

interface ServerSnapshot {
  trackedCount: number;
  improvedCount: number;
  dueCount: number;
  weakCount: number;
  topFocusSubskill: string | null;
  topImprovedSubskill: string | null;
}

const RECENT_MS = 1000 * 60 * 60 * 24 * 7;

function deriveLocal(
  stats: UserPracticeStats,
  weakSpots: WeakSpot[],
): ServerSnapshot {
  const itemStats = stats.itemStats ?? {};
  const recent = stats.recentMistakeIds ?? [];
  const now = Date.now();
  let improvedCount = 0;
  let trackedCount = 0;
  for (const [, s] of Object.entries(itemStats)) {
    if (!s) continue;
    trackedCount += 1;
    const seenRecently = (s.lastSeenAt ?? 0) > now - RECENT_MS;
    if (seenRecently && s.timesCorrect > s.timesWrong && s.timesSeen >= 2) {
      improvedCount += 1;
    }
  }
  let topImprovedSubskill: string | null = null;
  let topImprovedScore = -Infinity;
  const subStats = stats.subskillStats ?? {};
  for (const [key, s] of Object.entries(subStats)) {
    if (!s) continue;
    const total = s.attempts ?? ((s.correctAttempts ?? 0) + (s.incorrectAttempts ?? 0));
    if (total < 4) continue;
    const acc = (s.correctAttempts ?? 0) / total;
    if (acc >= 0.75 && acc > topImprovedScore) {
      topImprovedScore = acc;
      topImprovedSubskill = key.split("/")[1] ?? null;
    }
  }
  return {
    trackedCount,
    improvedCount,
    dueCount: countDueItems(stats),
    weakCount: recent.length,
    topFocusSubskill: weakSpots[0]?.subskill ?? null,
    topImprovedSubskill,
  };
}

function toFriendly(
  sub: string | null,
): { en: string; sv: string } | null {
  if (!sub) return null;
  return {
    en: friendlySubskillName(sub, "en"),
    sv: friendlySubskillName(sub, "sv"),
  };
}

function snapshotsEqual(a: ServerSnapshot, b: ServerSnapshot): boolean {
  return (
    a.trackedCount === b.trackedCount &&
    a.improvedCount === b.improvedCount &&
    a.dueCount === b.dueCount &&
    a.weakCount === b.weakCount &&
    a.topFocusSubskill === b.topFocusSubskill &&
    a.topImprovedSubskill === b.topImprovedSubskill
  );
}

export function useEchoMemory(): EchoMemorySummary {
  const { stats, weakSpots } = usePracticeStats();
  const { userId, loading: authLoading } = useAuth();
  const [server, setServer] = useState<ServerSnapshot | null>(null);
  const lastSentRef = useRef<ServerSnapshot | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;
    let cancelled = false;
    api.echoMemory
      .get()
      .then((res) => {
        if (cancelled) return;
        if (res?.echoMemory) {
          setServer({
            trackedCount: res.echoMemory.trackedCount ?? 0,
            improvedCount: res.echoMemory.improvedCount ?? 0,
            dueCount: res.echoMemory.dueCount ?? 0,
            weakCount: res.echoMemory.weakCount ?? 0,
            topFocusSubskill: res.echoMemory.topFocusSubskill ?? null,
            topImprovedSubskill: res.echoMemory.topImprovedSubskill ?? null,
          });
        }
      })
      .catch(() => {
        /* offline / unauthenticated — fall back to local-only */
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, userId]);

  const local = useMemo(() => deriveLocal(stats, weakSpots), [stats, weakSpots]);

  useEffect(() => {
    if (authLoading || !userId) return;
    if (local.trackedCount === 0) return;
    if (lastSentRef.current && snapshotsEqual(lastSentRef.current, local)) {
      return;
    }
    const handle = setTimeout(() => {
      const attempt = local;
      api.echoMemory
        .upsert(attempt)
        .then(() => {
          lastSentRef.current = attempt;
        })
        .catch(() => {
          /* leave lastSentRef unchanged so the next render retries */
        });
    }, 1500);
    return () => clearTimeout(handle);
  }, [local, authLoading, userId]);

  const merged: ServerSnapshot =
    local.trackedCount > 0 ? local : (server ?? local);

  return {
    hasData: merged.trackedCount > 0,
    weakCount: merged.weakCount,
    dueCount: merged.dueCount,
    improvedCount: merged.improvedCount,
    trackedCount: merged.trackedCount,
    topFocus: toFriendly(merged.topFocusSubskill),
    topImproved: toFriendly(merged.topImprovedSubskill),
  };
}
