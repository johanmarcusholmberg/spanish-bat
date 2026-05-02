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

## Subscriptions (Phase 8 — foundation only)

- Spec referenced Supabase; this project uses Clerk + Drizzle/Postgres, so the Supabase tables/RLS were implemented as Drizzle tables with API-server enforcement instead. Same architectural goals.
- Shared package: `@workspace/subscription` (`lib/subscription/`) — contains `PlanId`, `EntitlementKey`, `SubscriptionStatus`, `UserSubscription`, `UserEntitlements` types plus the Model A / Model B plan config and `entitlementsForPlan()`.
- Active model: **Model A (Free / Premium)** via `ACTIVE_SUBSCRIPTION_MODEL` in `lib/subscription/src/config.ts`. Model B (Free / Learn / Pro) is fully defined in config but not surfaced in UI.
- Server helpers: `artifacts/api-server/src/lib/subscription.ts` — `getUserEntitlements`, `hasEntitlement`, `getCurrentPlan`, `isPremium`, `getActiveSubscription`. Free is the safe default — no provider needed.
- API routes (`artifacts/api-server/src/routes/subscription.ts`):
  - `GET /api/subscription` (auth required) — full entitlement view + active subscription.
  - `GET /api/subscription/plans` (public) — plan list for the active model.
- Frontend hooks (web): `useSubscription`, `useEntitlement(key)`, `usePremiumGate()` in `artifacts/murcielago/src/hooks/`.
- Frontend hooks (mobile): same names/shape in `artifacts/mobile/hooks/`.
- **Not yet implemented (later phases)**: Stripe Checkout/webhook handlers, RevenueCat SDK init, paywall UI, plan upgrade screens, App Store / Play product registration. Plan rows for Stripe price IDs and store product IDs are nullable placeholders in `subscription_plans`.

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

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
