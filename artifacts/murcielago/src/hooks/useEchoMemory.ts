import { useMemo } from "react";
import {
  countDueItems,
  friendlySubskillName,
  type WeakSpot,
  type UserPracticeStats,
} from "@workspace/practice";
import { usePracticeStats } from "@/hooks/usePracticeStats";

export interface EchoMemorySummary {
  /** Whether the user has any practice history at all. */
  hasData: boolean;
  /** Phrases the user has tripped on recently. */
  weakCount: number;
  /** Items currently due for review. */
  dueCount: number;
  /** Items that are getting stronger (more correct than wrong, seen recently). */
  improvedCount: number;
  /** Total items Murci has seen the user practice. */
  trackedCount: number;
  /** First friendly subskill name (e.g. "travel phrases"). */
  topFocus: { en: string; sv: string } | null;
  /** First friendly subskill name the user is improving on. */
  topImproved: { en: string; sv: string } | null;
}

const RECENT_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function deriveSummary(
  stats: UserPracticeStats,
  weakSpots: WeakSpot[],
): EchoMemorySummary {
  const itemStats = stats.itemStats ?? {};
  const recent = stats.recentMistakeIds ?? [];
  const now = Date.now();

  let improvedCount = 0;
  let trackedCount = 0;
  let topImprovedSubskill: string | null = null;
  let topImprovedScore = -Infinity;

  for (const [, s] of Object.entries(itemStats)) {
    if (!s) continue;
    trackedCount += 1;
    const seenRecently = (s.lastSeenAt ?? 0) > now - RECENT_MS;
    if (seenRecently && s.timesCorrect > s.timesWrong && s.timesSeen >= 2) {
      improvedCount += 1;
    }
  }

  // Pick a topImproved subskill from the subskillStats if available.
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

  const topFocusSub = weakSpots[0]?.subskill ?? null;
  const topFocus =
    topFocusSub != null
      ? {
          en: friendlySubskillName(topFocusSub, "en"),
          sv: friendlySubskillName(topFocusSub, "sv"),
        }
      : null;
  const topImproved =
    topImprovedSubskill != null
      ? {
          en: friendlySubskillName(topImprovedSubskill, "en"),
          sv: friendlySubskillName(topImprovedSubskill, "sv"),
        }
      : null;

  return {
    hasData: trackedCount > 0,
    weakCount: recent.length,
    dueCount: countDueItems(stats),
    improvedCount,
    trackedCount,
    topFocus,
    topImproved,
  };
}

export function useEchoMemory(): EchoMemorySummary {
  const { stats, weakSpots } = usePracticeStats();
  return useMemo(() => deriveSummary(stats, weakSpots), [stats, weakSpots]);
}
