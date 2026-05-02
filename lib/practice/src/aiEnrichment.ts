/**
 * AI enrichment helper for the practice session engine.
 *
 * Wraps `buildPracticeSession` so callers can optionally fetch extra
 * AI-generated items when the local curated/template pool is thin or
 * when the user explicitly asks for fresh practice. The fetcher is
 * platform-injected (web, mobile) so this library has zero network
 * dependencies and stays platform-safe.
 *
 * Failure mode: if the fetcher throws or returns nothing, we silently
 * fall back to the local-only session — AI is never required for the
 * app to function.
 */

import {
  buildPracticeSession,
  type BuildSessionOptions,
  type PracticeItem,
  type PracticeSession,
  type SkillCategory,
  type Level,
} from "./index";

export interface AIPracticeFetchInput {
  userLevel: Level;
  practiceMode: BuildSessionOptions["mode"];
  count: number;
  weakSpots: string[];
  avoidPrompts: string[];
  previousMistakes: string[];
  targetSkill?: string;
}

export interface FetchedAIItem<TPayload> {
  /** Stable id, server-generated. */
  id: string;
  skill: SkillCategory;
  level: Level;
  category?: string;
  difficulty?: 1 | 2 | 3;
  payload: TPayload;
}

export type AIPracticeFetcher<TPayload> = (
  input: AIPracticeFetchInput,
) => Promise<FetchedAIItem<TPayload>[]>;

export interface BuildSessionWithAIOptions<TPayload>
  extends BuildSessionOptions<TPayload> {
  ai?: {
    fetcher: AIPracticeFetcher<TPayload>;
    /**
     * If the local candidate pool is at or below this number, we ask
     * the fetcher for more items. Set to 0 to never auto-trigger;
     * callers can still call `enrichSessionWithAI` explicitly.
     */
    minLocalPool?: number;
    /** Force a fetch even when the pool is healthy. */
    force?: boolean;
    /** Optional topic hint passed through to the backend. */
    targetSkill?: string;
    /** Recent mistakes to bias generation. */
    previousMistakes?: string[];
    /** Hard cap on items to request. Defaults to session size. */
    maxItems?: number;
  };
}

/**
 * Build a session, optionally enriching with AI items when the local
 * pool is thin. Always returns a usable session — AI failures are swallowed.
 */
export async function buildPracticeSessionWithAI<TPayload>(
  opts: BuildSessionWithAIOptions<TPayload>,
): Promise<PracticeSession<TPayload>> {
  const { ai, ...sessionOpts } = opts;
  const localCandidates = sessionOpts.items.length;
  const minPool = ai?.minLocalPool ?? 8;
  const shouldFetch = !!ai && (ai.force || localCandidates <= minPool);

  let allItems = sessionOpts.items as ReadonlyArray<PracticeItem<TPayload>>;

  if (shouldFetch && ai) {
    try {
      const want = Math.max(1, ai.maxItems ?? sessionOpts.size ?? 8);
      const weakSubs = Array.from(
        new Set(
          (sessionOpts.stats?.recentMistakeIds ?? []).slice(0, 8),
        ),
      );
      // We can't reach into payloads (opaque) for "avoidPrompts" — leave
      // that to callers that wrap the fetcher.
      const fetched = await ai.fetcher({
        userLevel: sessionOpts.level,
        practiceMode: sessionOpts.mode,
        count: want,
        weakSpots: weakSubs,
        avoidPrompts: [],
        previousMistakes: ai.previousMistakes ?? [],
        targetSkill: ai.targetSkill,
      });
      if (Array.isArray(fetched) && fetched.length > 0) {
        allItems = [...allItems, ...fetched];
      }
    } catch {
      // Silent fallback — local pool is still usable.
    }
  }

  return buildPracticeSession({ ...sessionOpts, items: allItems });
}
