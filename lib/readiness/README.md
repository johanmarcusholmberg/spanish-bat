# `@workspace/readiness`

Shared readiness model for Murciélingo (web + mobile).

## Why

Practice in Murciélingo is open-ended. Users should never feel "out of practice"
unless they are genuinely ready to take a level test — and even then they can
decline and keep practicing. The old `X / Y exercises completed` model implied
a finite checklist. Readiness replaces it with a soft 0–100 score per CEFR level.

## How readiness is calculated

For the user's current level the model blends three signals:

| Signal     | Weight | What it measures                                              |
| ---------- | ------ | ------------------------------------------------------------- |
| Coverage   | 70%    | How much practice the user has done in each skill category    |
| Variety    | 15%    | How many distinct skill categories the user has touched (4+)  |
| Quality    | 15%    | Recent accuracy (0..1) minus a small "repeated mistakes" hit  |

**Coverage** sums per-category practice counts (vocabulary, grammar, sentences,
reading, listening, speaking) against soft per-level targets defined in
`LEVEL_TARGETS`. Each category is capped at 100% so drilling one skill alone
can never reach "test ready".

**Variety** is `min(categoriesTouched / 4, 1)`. Users who only touch one
category get a small bonus; broad practice gets the full bonus.

**Quality** = `clamp(recentAccuracy − repeatedMistakes / 20, 0, 1)`.

A safety rule: if fewer than two skill categories have any practice the score
is clamped just below the test-recommended threshold (so brand-new users with a
single high-accuracy category don't immediately get a "take the test" prompt).

## Three level states

| Score / flag                       | State                       | UX                                              |
| ---------------------------------- | --------------------------- | ----------------------------------------------- |
| `< 70`                             | `learning`                  | "Keep practicing this level"                    |
| `>= 70` and not yet passed         | `test_recommended`          | "Take level check" / "Keep practicing" / weak spots |
| `hasPassedLevelTest === true`      | `passed_but_can_continue`   | "Move to next level" / "Continue" / "Mix"       |

The model never forces advancement — a user can always decline the test.

## Backward compatibility

`progressRowsToInputs(rows, extras)` maps the legacy
`{ category, completed, total }` rows from `user_progress` into the new
`ReadinessInputs` shape, so existing saved progress still produces a sensible
score with no migration. `flashcards` rows are merged into `vocabularyPractice`.
