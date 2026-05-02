# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (API server)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### `artifacts/murcielago` — Murciélingo Spanish Learning App (web)
- React + Vite + TypeScript frontend
- Routes: `/` (login), `/register`, `/dashboard`, `/practice/*`, `/grammar`, `/conversation`, `/admin`, etc.
- Auth: **Clerk** (`@clerk/react` v6) — email/password + Google OAuth + Apple OAuth
- CSS: Tailwind v3 (postcss), custom design tokens in `index.css`, fonts from Google Fonts
- Key contexts: `AuthContext`, `ProgressContext`, `StreakContext`, `LanguageContext`
- All data fetching via `src/lib/api.ts` fetch client hitting `/api/*` on the API server
- No Supabase references remain — fully migrated

### `artifacts/api-server` — Express REST API (port 8080)
- Routes:
  - `GET/POST /api/profile` — user profile (Clerk JWT auth)
  - `GET/POST /api/progress` — lesson progress
  - `GET/PUT /api/streaks` — daily streaks + activity logging
  - `GET/POST/PUT /api/vocabulary` — saved vocabulary words
  - `GET/POST/DELETE /api/flashcard-srs` — spaced repetition state
  - `POST /api/contact` — contact form messages
  - `GET /api/admin/users`, `GET /api/admin/messages`, `GET /api/admin/insights` — admin endpoints
  - `POST /api/ai/translate` — Spanish translation (OpenAI)
  - `POST /api/ai/conversation` — streaming conversation (OpenAI)
- Auth middleware: Clerk JWT verification (`@clerk/express`)
- DB: `@workspace/db` (Drizzle ORM, PostgreSQL)
- AI: OpenAI via Replit AI Integrations proxy

## Database Schema (`lib/db/src/schema/`)

Tables (all exported from `index.ts`):
- `profiles` — user profile (displayName, level, learningFrom, onboardingCompleted, placementTestCompleted)
- `user_roles` — admin/role flags
- `user_streaks` — streak tracking
- `activity_log` — activity history
- `user_progress` — per-lesson progress
- `user_last_activity` — last visited pages
- `grammar_progress` — grammar exercise results
- `user_vocabulary` — saved words
- `flashcard_srs` — spaced repetition card state
- `contact_messages` — contact form submissions
- `subscription_plans` — plan catalog with Stripe / RevenueCat / store product IDs (Phase 8)
- `user_subscriptions` — per-user, per-provider subscription rows (Phase 8)
- `user_entitlements` — denormalized entitlement grants, incl. promo/manual (Phase 8)
- `subscription_events` — append-only provider webhook log (Phase 8)
- `customer_mapping` — internal user_id ↔ Stripe / RevenueCat customer ids (Phase 8)

## Subscriptions (Phase 8 — foundation, Phase 9 — Stripe web, Phase 10 — RevenueCat mobile)

- Spec referenced Supabase; this project uses Clerk + Drizzle/Postgres, so the Supabase tables/RLS were implemented as Drizzle tables with API-server enforcement instead. Same architectural goals.
- Shared package: `@workspace/subscription` (`lib/subscription/`) — contains `PlanId`, `EntitlementKey`, `SubscriptionStatus`, `UserSubscription`, `UserEntitlements` types plus the Model A / Model B plan config and `entitlementsForPlan()`.
- Active model: **Model A (Free / Premium)** via `ACTIVE_SUBSCRIPTION_MODEL` in `lib/subscription/src/config.ts`. Model B (Free / Learn / Pro) is fully defined in config but not surfaced in UI.
- Server helpers: `artifacts/api-server/src/lib/subscription.ts` — `getUserEntitlements`, `hasEntitlement`, `getCurrentPlan`, `isPremium`, `getActiveSubscription`. Free is the safe default — no provider needed.
- API routes (`artifacts/api-server/src/routes/subscription.ts`):
  - `GET /api/subscription` (auth required) — full entitlement view + active subscription.
  - `GET /api/subscription/plans` (public) — plan list for the active model.
- Frontend hooks (web): `useSubscription`, `useEntitlement(key)`, `usePremiumGate()` in `artifacts/murcielago/src/hooks/`.
- Frontend hooks (mobile): same names/shape in `artifacts/mobile/hooks/`.

### Phase 9 — Stripe web subscriptions

- Web only; mobile keeps RevenueCat (App Store / Play Store policy).
- Stripe SDK installed in `@workspace/api-server`. Lazy client in `src/lib/stripe.ts` — `isStripeConfigured()` / `warnIfStripeMissing()`. Boots cleanly without env vars (logs a single startup warning, `/api/stripe/config` returns `enabled:false`).
- Sync layer `src/lib/stripeSync.ts` handles `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, `invoice.payment_{succeeded,failed}`. Upserts `user_subscriptions` + `customer_mapping`, then rewrites entitlements: deletes ALL `plan:%` rows for the user and re-inserts current plan grants if active. Manual / promo grants (`promo:`, `manual:`) are preserved. Duplicates detected by Postgres unique-violation code (23505) only — other DB errors propagate so Stripe retries.
- Routes (`src/routes/stripe.ts`, all auth-required except config):
  - `GET /api/stripe/config` — public, `{ enabled, publishableKey, prices }`.
  - `POST /api/stripe/checkout` — creates a Checkout Session (mode=subscription) with `metadata.userId` + `client_reference_id`.
  - `POST /api/stripe/portal` — Customer Portal session.
  - `GET /api/stripe/checkout/:id` — strict ownership: metadata, `client_reference_id`, OR `customer_mapping` must match `req.userId`.
  - `GET /api/stripe/subscriptions` — current user's Stripe subs.
- Webhook (`src/routes/stripeWebhook.ts`) mounted at exact path `/api/stripe/webhook` with `express.raw({type:"application/json"})` BEFORE `express.json()` in `app.ts`. Other `/api` routes still parse JSON normally.
- Web UI: `src/lib/api.ts` `api.stripe.*`; pages `PricingPage` (public, replaces old static `/pricing`), `BillingSuccessPage` (polls `/api/subscription` directly — not stale `isPremium` closure), `BillingCancelledPage`, `ManageSubscriptionPage`. Components `PremiumBadge`, `LockedFeature`. Routes wired in `App.tsx`.
- Required secrets (none set yet — app runs without them): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`, `VITE_STRIPE_PUBLISHABLE_KEY`. Setup walkthrough in `docs/stripe-setup.md`.

### Phase 11 — QA / launch readiness
- New API endpoints: `GET /api/subscription/health` (public, returns presence-only env booleans — never secret values) and `GET /api/admin/subscriptions` (admin-only, per-user plan / entitlements / last sync, plus the latest 50 webhook events).
- `GET /api/subscription` now returns `lastSyncAt` (max of the user's `user_subscriptions.updated_at` and `user_entitlements.granted_at`).
- Web: new `EntitlementError` component (4 variants: `entitlement-load`, `stripe-unavailable`, `revenuecat-unavailable`, `missing-env`) wired into `PricingPage` and `ManageSubscriptionPage`. New dev-only `SubscriptionDebugPanel` (gated by `import.meta.env.DEV`, tree-shaken from production builds). New `Subs` tab in `AdminPage` for current plan / entitlement / sync visibility.
- Mobile: mirrored `EntitlementError` and `SubscriptionDebugPanel` (gated by `__DEV__`) wired into `paywall.tsx`. `useSubscription` keeps the last good payload on error so a transient blip cannot downgrade a paying user mid-session.
- Webhook idempotency confirmed via the existing unique `(provider, provider_event_id)` index on `subscription_events` + `onConflictDoNothing`-style 23505 handling in both `stripeSync.ts` and `revenuecatSync.ts`. Entitlement sync uses wipe-and-reinsert of `plan:%` source rows so promo / manual grants survive.
- Authorization model documented in `.local/docs/subscription-rls-policies.md` — we use Drizzle on Postgres (no Supabase RLS); policy is enforced by `requireAuth` + `req.userId` filtering on every user-facing route, and by signature/auth-header verification on webhook endpoints.
- Launch docs (all under `.local/docs/`): `subscription-qa-checklist.md`, `subscription-rls-policies.md`, `subscription-secrets-audit.md`, `subscription-production-setup.md` (manual Stripe / RC / Apple / Google / privacy / terms steps), `subscription-launch-checklist.md`.

### Phase 10 — RevenueCat mobile subscriptions

- Mobile-only; web keeps Stripe. Apple forbids Stripe Checkout inside the iOS app for digital content.
- SDK: `react-native-purchases` installed in `@workspace/mobile`. Works in Expo Go via Preview API Mode — no native build needed in dev.
- Service: `artifacts/mobile/lib/revenuecat.ts` — lazy-loaded SDK, `initRevenueCat / identifyUser / logoutUser / getCurrentOffering / purchasePackage / restorePurchases / getCustomerInfo`. Every entry point is a safe no-op when keys aren't configured (free access keeps working).
- Config: `artifacts/mobile/lib/revenuecatConfig.ts` reads `EXPO_PUBLIC_RC_IOS_API_KEY`, `EXPO_PUBLIC_RC_ANDROID_API_KEY`, `EXPO_PUBLIC_RC_ENTITLEMENT_ID` (default `premium`), `EXPO_PUBLIC_RC_PRODUCT_MONTHLY/_YEARLY` (placeholders `murcielago_premium_(monthly|yearly)_v1`).
- Identity: RC `app_user_id === Clerk userId`. Set during `useSubscription` boot via `identifyUser(data.entitlements.userId)`.
- UI: paywall at `artifacts/mobile/app/paywall.tsx` (modal route, registered in `_layout.tsx`). Components `PremiumBadge`, `LockedFeature` (deep-links to `/paywall`).
- Server: `artifacts/api-server/src/routes/revenuecatWebhook.ts` mounted at `/api/revenuecat/webhook`. Auth by shared secret in `REVENUECAT_WEBHOOK_AUTH` (fail-closed — 503 if unset). Sync layer `src/lib/revenuecatSync.ts` writes into the same `user_subscriptions`, `user_entitlements`, `subscription_events`, `customer_mapping` tables Stripe uses; uses the same `plan:%` wipe-and-reinsert pattern, so users with both web and mobile subs always converge to the highest tier.
- Server env vars (optional): `RC_PRODUCT_MONTHLY`, `RC_PRODUCT_YEARLY` for deterministic product → plan mapping. Without them the webhook falls back to a `/premium|pro/i` regex on the product id.
- Manual dashboard setup (Apple IAP products, Google subscription products, RC project + entitlement + offering + webhook + product id mapping) is documented in `artifacts/mobile/README.md` → "Subscriptions (Phase 10 — RevenueCat / Mobile IAP)".

## Auth

- **Clerk** keys set: `VITE_CLERK_PUBLISHABLE_KEY` (frontend), `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` (backend)
- SSO callback route: `/sso-callback` (frontend)
- API server uses `requireAuth()` middleware from `@clerk/express`

## AI Integration

- **OpenAI via Replit proxy**: `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` env vars
- Package: `@workspace/integrations-openai-ai-server` added to api-server

## Mobile Release Status (Phase 6)

- Mobile typecheck: green (`pnpm --filter @workspace/mobile run typecheck`).
- Routing: `app/index.tsx` redirects to `/login` or `/(tabs)` based on Clerk auth state. All screens registered in `app/_layout.tsx`.
- No Supabase references; auth via Clerk, data via `@workspace/api-server`.
- Pre-launch checklist + open blockers tracked in `artifacts/mobile/RELEASE_CHECKLIST.md`.
- **Web preview note**: the mobile artifact's web preview shows Expo's "Welcome to Expo" placeholder because `(tabs)/_layout.tsx` imports native-only modules (`expo-router/unstable-native-tabs`, `expo-glass-effect`, `expo-symbols`). This is dev-only — Expo Go, iOS, and Android render the real app. Test on device or simulator.

## Phase 15 — Weak-spot tracking (shared web + mobile)

Shared in `lib/practice/src/weakSpots.ts`:
- `SubskillStat` per `${skill}/${subskill}` key (rolling accuracy, confidence, mistake count, last-practiced).
- `recordAttempt(stats, input)` — pure update; missing subskill normalizes to `"general"`.
- `detectWeakSpots(stats, opts)` — flags `low_accuracy` / `repeated_misses` / `low_confidence` / `stale`; produces friendly `WeakSpotLabel` (`needs_practice`, `good_to_review`, `getting_stronger`, `focus_area`).
- `buildTodaysFocusMessage(stats, { weakSpots })` — bilingual (en/sv), always supportive tone.
- `friendlySubskillName`, `friendlySkillName`, `friendlyLabel` for UI.

Engine integration in `lib/practice/src/index.ts`:
- `UserPracticeStats.subskillStats` field; `InternalCtx.weakSubskills` set built from `detectWeakSpots`.
- `scoreItem` adds +22 (or +36 in `weak_spots` mode) when `subskillKey(item.skill, item.category ?? "general")` matches a weak subskill — uncategorized items also participate.
- `weakSubskill` exposed in score breakdown for debugging.

Persistence + UI:
- Web `artifacts/murcielago/src/hooks/usePracticeStats.ts` — localStorage `murci.practiceStats.v1.<userId|anon>`.
- Mobile `artifacts/mobile/hooks/usePracticeStats.ts` — AsyncStorage same key; `dirtyRef` guards against late-load overwriting fresh writes.
- `WeakSpotsCard` (web + mobile) shows top focus areas + "Today's focus" copy and links to `/practice/session?mode=weak_spots`.

## Phase 16 — Level Check (shared web + mobile)

- New shared package `@workspace/level-check` (`lib/level-check/`):
  - Blueprint types: `LevelCheckBlueprint` + `LevelCheckSection` (skill, optional subskill, count, `minAccuracy` for critical sections).
  - Initial blueprints: `A1_BLUEPRINT` (vocab 5 / phrases 5 / sentences 5 / reading 3 / listening-speaking 2, threshold 0.75) and `A2_BLUEPRINT` (vocab / grammar / sentences 5 each / dialogue 3 / scenario 2, threshold 0.75). Exposed via `getLevelCheckBlueprint(level)` and `LEVEL_CHECK_BLUEPRINTS`.
  - `buildLevelCheckSession({ blueprint, items })` selects items section-by-section with widening fallbacks (exact skill+subskill → skill at level → skill any level → any item at level). Reuses `PracticeItem` from `@workspace/practice` so existing content sources work directly.
  - `evaluateLevelCheck(session, answers)` returns a weighted overall accuracy plus per-section results, strengths (≥0.8), focus areas (<0.7), and a `passed` flag (overall ≥ threshold AND no critical section below `minAccuracy`).
  - `getLevelCheckCopy(result, lang, nextLevel)` provides bilingual headlines/buttons; `getLevelCheckRecommendation(level, readinessState)` returns the non-blocking trigger payload.
- Web (`artifacts/murcielago`):
  - New `LevelCheckPage` at `/level-check` (intro → test runner → result). Test runner shows no hints/explanations during questions.
  - `LevelAdvancementCard` "Take level check" now navigates to `/level-check` instead of `/placement-test`. Existing "Keep practicing" / "Practice weak spots" buttons remain — never blocking.
- Mobile (`artifacts/mobile`):
  - New `app/level-check.tsx` screen registered in `_layout.tsx`. Persists pass state to `AsyncStorage` under `murci.passedLevelCheck.<userId>.<level>` so the dashboard readiness card picks it up.
  - Dashboard `test_recommended` block now reads "You look ready for the {next} check." and routes "Take level check" to `/level-check`. "Keep practicing" and "Practice weak spots" remain.
- The level-check flow is intentionally non-blocking: the user can always exit, decline the recommendation, or jump straight to weak-spot practice instead. Pass state is only set after a successful evaluation, never on click.

## Phase 18 — Persisted Practice Items Library

AI-generated practice is no longer thrown away after one session. Approved generic items are saved to a shared library and reused.

- **DB schema** `lib/db/src/schema/practiceItems.ts`:
  - `practice_items` — id, level, skill, subskill, prompt, expectedAnswer, acceptedAnswers (jsonb), explanation, difficulty (real), source (curated|template|ai), createdAt, approved, usageCount, successCount, reportCount, languageOfPrompt, tags (jsonb), promptNorm (UNIQUE), flagged. Indexes on (approved, flagged) and (level, skill).
  - `practice_item_reports` — id, itemId, userId, reason (confusing|wrong_answer|too_hard|too_easy), note, createdAt.
- **PII filter** `lib/practice-ai/src/personalFilter.ts`: `looksPersonal(...texts)` — regex heuristics for emails, phones, URLs, "my name is / me llamo / jag heter" identity patterns. Re-exported from `@workspace/practice-ai`.
- **AI persistence** `artifacts/api-server/src/routes/practiceAi.ts`: after `validateAIPracticeItems`, generic non-personal items are upserted via `persistApprovedAIItems`. Dedup keyed on normalised prompt; existing rows return their id so the client can link future feedback. The response now includes the persisted `id` per item.
- **Routes** `artifacts/api-server/src/routes/practiceItems.ts`:
  - `GET /api/practice-items?level=A1&limit=200` — approved + non-flagged items.
  - `POST /api/practice-items/:id/report` — body `{reason, note?}`. Dedupes per (user,item,reason); auto-flags items at `reportCount ≥ 3`.
  - `POST /api/practice-items/:id/usage` — body `{correct}`. Atomic SQL increments on usageCount/successCount.
- **Reuse** Web (`PracticeSessionPage.tsx`) and mobile (`app/practice/session.tsx`) both call `api.practiceItems.list()` once and merge the converted items into `buildAllPracticeItems()` before `buildPracticeSession`, so the engine selects across curated + template + saved-AI candidates uniformly.
- **Client adapters** `artifacts/{murcielago,mobile}/lib/savedPracticeItems.ts` — convert DB rows to `LocalPracticeItem` / `MobilePracticeItem`. Mobile synthesises MCQ distractors from sibling answers + a fallback list. Local ids prefixed `saved-<uuid>` so `persistedIdFromLocalId` can recover the DB id for usage/report calls.
- **Report UI** Small "Something wrong?" disclosure shown after answering, with chips for the four reasons. Bilingual on web (sv/en). For local-only items the click is a no-op (no DB row to attach feedback to yet).

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
