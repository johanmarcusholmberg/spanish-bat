# Overview

This project is a pnpm monorepo for "Murciélingo", a Spanish learning application. It's built with TypeScript and aims to provide an engaging and effective language learning experience. The application features include interactive lessons, grammar explanations, conversation practice, vocabulary building, and spaced repetition for optimal learning. It targets both web and mobile platforms, with a strong focus on user progress tracking, personalized learning paths, and an integrated subscription model for premium features.

The business vision is to create a leading platform for Spanish language acquisition, leveraging modern web and AI technologies to offer a highly personalized and adaptive learning journey. The project's ambition is to expand into multiple languages and become a comprehensive learning ecosystem.

# User Preferences

I want iterative development and detailed explanations.

# System Architecture

The project is structured as a pnpm workspace monorepo.

**Core Technologies:**
- **Monorepo**: pnpm workspaces
- **Language**: TypeScript 5.9
- **Backend**: Node.js 24, Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4), `drizzle-zod`
- **Build**: esbuild (API server)

**UI/UX Decisions:**
- **Frontend Framework**: React + Vite (web), Expo/React Native (mobile)
- **CSS**: Tailwind CSS v3 (postcss) with custom design tokens.
- **Authentication UI**: Managed by Clerk components and UI flows.
- **Design Principles**: Focus on a clean, intuitive interface with clear progress indicators and engaging elements for language learning.
- **Color Scheme**: Defined in `index.css` with custom design tokens.
- **Fonts**: Sourced from Google Fonts.

**Technical Implementations & Feature Specifications:**

- **Authentication**: Utilizes Clerk for email/password, Google OAuth, and Apple OAuth.
- **Auth Phase C — Admin Productionization**: Hardens the admin auth surface for live keys.
  - **Admin TOTP enforcement**: Admin Clerk users must complete TOTP enrolment. The first-party `/admin/setup-2fa` flow (web `AdminSetup2FAPage.tsx`, mobile `app/admin-setup-2fa.tsx`) calls `clerkUser.createTOTP()` → `verifyTOTP({ code })` → `createBackupCode()` and posts `/audit/2fa-enrolled`, which patches Clerk `user.public_metadata.adminTotpEnrolled = true`. The `/profile` API returns this flag; `AdminPage` and admin sub-pages redirect to `/admin/setup-2fa` until it's true. Sign-in detects `supportedSecondFactors[].strategy === "totp"` and routes the UI to the authenticator-code prompt (with a "use a backup code instead" toggle).
  - **Invitation-driven admin onboarding**: New admins are added via Clerk's invitations API at `/admin/invites` (web `AdminInvitesPage.tsx`). Server route `routes/adminInvites.ts` writes a `user_roles` row keyed by `(email, role)` and calls `clerkClient.invitations.createInvitation`. The invited user signs in via the Clerk-hosted ticket; the `clerk.svix` webhook (`routes/clerkWebhook.ts` mounted with `express.raw` BEFORE `express.json` in `app.ts`) handles `user.created` and binds `clerkUserId` onto the matching email row.
  - **`user_roles` keyed by `(clerk_user_id, email)`**: Schema added `clerkUserId`, `email`, `invitedByEmail`, `invitedAt`, `acceptedAt`, `createdAt` and a unique `(email, role)` constraint (`lib/db/src/schema/user_roles.ts`). The lookup helper `lib/roles.ts#getUserRoles` resolves first by `clerk_user_id`, then by email (and binds the id back if missing). Backfilled the seed admin row to `johanmarcusholmberg@gmail.com` / `user_3DCQI1zEs8wChhCUI6mto3wlKtU`.
  - **Audit log**: New `audit_log` table (`lib/db/src/schema/auditLog.ts`) with `userId`, `email`, `action`, `target`, `ip`, `userAgent`, `metadata`. Server helpers `lib/audit.ts` (`recordAudit`, `reqAudit`, `AuditAction` enum) write entries from `/audit/sign-in`, `/audit/sign-out`, `/audit/2fa-enrolled`, the Clerk webhook (`session.created`, `session.ended`, `user.created`, `user.deleted`) and admin actions (invite create/revoke). Admins read entries via `/admin/audit` (web page, filterable by action + email).
  - **Hardened Clerk dashboard config (manual ops)**: In Clerk dashboard for the production instance: enable "Require TOTP for users with `public_metadata.role = admin`", restrict invitation creation to backend API only, enable session revocation on password change, configure allowed origins to include the deployed `*.replit.app` host, and configure the user.created / session.* / user.deleted webhook to point at `POST {API_URL}/clerk/webhook` (svix signing).
  - **Production keys**: `CLERK_PUBLISHABLE_KEY` (`pk_live_*`) and `CLERK_SECRET_KEY` (`sk_live_*`) are stored as deployment secrets — never in repo. `CLERK_WEBHOOK_SECRET` (svix `whsec_*`) is required for the webhook route to verify signatures. Local development continues to use `pk_test_*` / `sk_test_*`.
  - **Auth error UX**: All auth errors stay as floating toasts on web (`toast({ variant: "soft" })`) and `<AuthMessageBanner>` on mobile — no inline alerts.
- **API Design**: RESTful API built with Express, secured with Clerk JWT verification middleware.
- **Database Schema**: Comprehensive schema covering user profiles, progress, streaks, vocabulary, spaced repetition, and a detailed subscription system.
- **Subscription Model**: Implemented with a flexible `SubscriptionModel` supporting Free/Premium tiers, managed through a shared `@workspace/subscription` package. Integrates with Stripe for web and RevenueCat for mobile in-app purchases.
- **AI Integration**: Uses OpenAI via Replit AI Integrations proxy for features like translation and conversational practice.
- **Weak-Spot Tracking**: A shared mechanism to identify and prioritize subskills needing practice based on user performance (accuracy, confidence, repetition).
- **Level Check**: A non-blocking assessment system (`@workspace/level-check`) to evaluate user proficiency (e.g., A1, A2) and recommend next steps.
- **Persisted Practice Items Library**: AI-generated practice items are stored in a database, approved, and reused, reducing redundancy and improving content quality. Includes PII filtering for AI-generated content.
- **Spaced Repetition System (SRS)**: An SM-2-lite based scheduler implemented in `lib/practice/src/srs.ts` to optimize review timing for vocabulary and concepts. It integrates with user practice statistics and guides daily review recommendations.
- **Mobile Development**: Uses Expo and React Native, ensuring a consistent experience with the web app, with specific adaptations for mobile platform features (e.g., RevenueCat for subscriptions). Mobile routing is handled by Expo Router.
- **Web Resume Card + Types Realignment (Phase 26)**: Wires the shared learning-coach stores into the web app and aligns React types with what Expo expects.
  - `artifacts/murcielago/src/components/ResumePracticeCard.tsx` — Today-screen card mirroring the mobile "Continue today's practice" affordance. Reads from `sessionStorageService` via `learningCoachStores`, hides itself when `isResumable` returns false, and offers a single CTA back into `/practice/session?mode=…`. Includes a dismiss button that calls `clearCompletedSession()`.
  - `artifacts/murcielago/src/pages/DashboardPage.tsx` — renders `<ResumePracticeCard />` between `EchoSteps` and `TodaysPracticeCard`, matching the mobile Today layout.
  - `artifacts/murcielago/src/pages/PracticeSessionPage.tsx` — `prepareSession` now seeds a fresh active-session envelope (`sessionStorageService.newSession` + `saveSessionProgress`), `handleNext` persists each step advance, and reaching the final item calls `clearCompletedSession()` so the resume card disappears as soon as the user finishes.
  - `pnpm-workspace.yaml` — bumped the `@types/react` / `@types/react-dom` catalog and overrides from `^19.2.0` to `~19.1.10` / `~19.1.7` so they match the React 19.1.0 runtime and the versions Expo's compatibility check expects. The Expo "packages should be updated" warning for those types is now gone.
- **Shared Learning-Coach Stores (Phase 25)**: Promotes the mobile-only persistence services into the framework-agnostic `@workspace/learning-coach` package so the web app can reuse the same caches:
  - `lib/learning-coach/src/kvStorage.ts` — tiny `KvStorage` adapter type plus a `localStorageKv()` factory that safely no-ops when `localStorage` isn't available.
  - `lib/learning-coach/src/sessionStorage.ts`, `learningCache.ts`, `notificationPreferences.ts` — `createSessionStorageService(kv)`, `createLearningCacheService(kv)` and `createNotificationPreferenceService(kv)` factories that take a `KvStorage` adapter. Storage keys, TTLs, default preferences and the serialized update chain all live in the shared package now.
  - `artifacts/mobile/lib/asyncStorageKv.ts` binds `AsyncStorage`; the existing mobile shims (`sessionStorageService.ts`, `learningCacheService.ts`, `notificationPreferenceService.ts`) now re-export the shared factories with no behaviour change. All previous named helpers (`cacheLevel`, `getCachedTodaySession`, `isResumable`, etc.) keep working.
  - `artifacts/murcielago/src/lib/learningCoachStores.ts` exposes the same services on the web via `localStorageKv()` so web flows can begin sharing the resume / offline-cache / notification-preference behaviour without duplicating code.
- **Mobile-Native Polish Surfaces (Phase 24)**: Builds on the Phase 23 foundations to ship the user-visible Echo / onboarding / notifications surfaces:
  - `app/welcome.tsx` — first-session onboarding screen explaining the Echo method and ending with a single CTA: "Start your first 3-minute practice." Verify-email now lands brand-new accounts here instead of the dashboard.
  - `components/EchoRecorder.tsx` — reusable Echo step UI that asks for mic permission contextually via `useMicrophonePermission`, records on supported platforms, and *always* exposes manual confidence buttons so it stays usable when recording isn't available. Hooks into `learningFeedbackService` for haptics.
  - `app/learn/echo.tsx` — focused 5-phrase Echo session using `EchoRecorder` and the `EchoSteps` strip, accessible from the onboarding/Today flows.
  - `expo-notifications` installed; `lib/notificationScheduler.ts` now schedules real daily / weekly local reminders (daily practice, weak words, streak, level readiness, weekly summary) governed by `notificationPreferenceService`. Web stays a safe no-op.
  - `components/NotificationPreferences.tsx` — opt-in Profile section that prompts the OS only when the user toggles the master switch, and reconciles scheduled reminders whenever a category or preferred hour changes.
  - Today screen now reads from `learningCacheService` (level + progress summary) when no fresh dashboard cache exists, and mirrors level + progress back into the cache after every successful fetch — closing the offline loop.
- **Free vs Premium Access Model (Phase 24)**: Adds a clear, central entitlement layer on top of the existing `@workspace/subscription` package so the Free tier feels like a *daily habit preview* and Premium feels like a *personal Spanish coach*. New shared modules:
  - `lib/subscription/src/featureAccess.ts` — `PlanFeatureAccess` (dailySessionLimit, maxSessionSteps, availableSessionLengths, per-mix `practiceMixAccess`, aiPractice, fullMistakeMemory, advancedProgress, fullEcho, recordingPlayback, offlineMode, customNotifications, levelCheckAttemptsPerLevel, libraryAccess, showLockedPreviews) plus `FREE_FEATURE_ACCESS` / `PREMIUM_FEATURE_ACCESS` constants and `getFeatureAccess` / `getMixAccess` / `canStartAnotherSession` helpers. `Number.POSITIVE_INFINITY` is used for unlimited values; check with `Number.isFinite` before slicing.
  - `lib/subscription/src/paywallCopy.ts` — centralized en/sv copy for 11 `PaywallContext` keys (`daily_session_done`, `locked_mix`, `advanced_insights`, `ai_generate`, `longer_session`, `full_echo`, `offline_mode`, `custom_notifications`, `level_check_limit`, `library_locked`, `generic`). Tone is warm, benefit-focused, with a clear free secondary path.
  - `lib/learning-coach/src/dailySessionCounter.ts` — KV-backed daily-session counter (resets on local YYYY-MM-DD rollover). Bound on web via `localStorageKv` (`dailySessionCounter` in `learningCoachStores.ts`) and on mobile via `asyncStorageKv` (`artifacts/mobile/lib/dailySessionCounter.ts`). Used to enforce the free tier's "1 Today's Practice/day" soft cap.
  - Web hooks `useFeatureAccess` and `useDailySessionLimit` (mirrored on mobile) read from the existing `useSubscription` query — no extra fetch.
  - Reusable `SoftPaywall` component (web `inline` and bottom-sheet `variant="sheet"`) renders `paywallCopy` for any `PaywallContext`. Wired into `PracticeMixesGrid` (lock badges + sheet on locked mix tap), `PracticeSessionPage` (caps free items to `access.maxSessionSteps`, records the daily counter on `prepareSession`, surfaces post-session paywall on the finished screen when the daily limit is reached) and `TodaysPracticeCard` (short-circuits to the paywall when the free user has already used today's session).
  - Mobile mirror: `PracticeMixesGrid.tsx` shows Premium/Preview pill + lock icon on locked mixes and routes them to `/paywall` instead of the session.
  - Follow-ups (not yet wired): cap the session-length picker to `access.availableSessionLengths` for free users; gate Library / Level Check / AI generation paths via the new hooks; use `fullMistakeMemory` / `advancedProgress` flags on the Progress screen; surface the soft paywall on Recording / Offline / Custom Notifications toggles.
- **Mobile-Native Polish Foundations (Phase 23)**: Adds reusable, framework-agnostic services in `artifacts/mobile/lib/` to prepare Murcielingo for native-mobile habits without breaking the web app:
  - `sessionStorageService.ts` + `useResumableSession` hook — persists in-progress practice sessions to AsyncStorage and powers a "Continue today's practice" card on the Today tab. Practice session screen tracks `appliedItemIds` so weak-spot/SRS updates are not double-counted on resume.
  - `learningCacheService.ts` — caches today's session, weak items, level and progress summary with TTL envelopes; also keeps an offline fallback session.
  - `audioPermissionService.ts` + `useMicrophonePermission` hook — permission state machine for Echo/speaking steps; web uses `MediaDevices`, native is a TODO that falls back to manual confidence.
  - `notificationPreferenceService.ts` + `notificationScheduler.ts` — opt-in preference model and provider-agnostic scheduler (placeholder until `expo-notifications` is added).
  - `learningFeedbackService.ts` — semantic feedback events (`feedbackCorrect`, `feedbackSessionComplete`, etc.) backed by `expo-haptics` on native and no-op on web. Wired into the practice session correct/incorrect/finish flow.
- **Session-First Learning UX (Phase 22)**: Both the web app AND the Expo mobile app share the "Today / Practice / Library / Progress / Profile" navigation. The post-login destination is the "Today" screen, organized around the Echo Steps strip, a single guided practice CTA, weak-item review, and a never-pushy Level Readiness card (test always optional). The `/practice` route shows purpose-based "Practice Mixes" plus a manual-mode grid; `/library` exposes grammar, vocabulary, reading and reference materials. Mobile mirrors this exactly via `app/(tabs)/{index,exercises,library,progress,profile}.tsx` plus native `EchoSteps`, `LevelReadinessCard`, and `PracticeMixesGrid` components in `artifacts/mobile/components/`. Hidden routes (`vocabulary`, `grammar`, `reading`) remain reachable via deep-links from the Library tab. The framework-agnostic learning logic lives in a shared `@workspace/learning-coach` package (`lib/learning-coach`): `learningStates.ts` (soft state model: new / learning / practicing / strong / mastered / needs_review), `mistakeMemory.ts` (storage-agnostic recurring-mistake tracker — bound to `localStorage` on web and `AsyncStorage` on mobile via a small adapter), and `aiPractice.ts` (AI generation interfaces with safe deterministic fallbacks; TODOs mark where to wire the AI Integrations proxy). The web client keeps thin `src/lib/{learningStates,mistakeMemory,aiPractice}.ts` shims that re-export the shared package and bind the browser's `localStorage`. The reusable `EchoSteps` strip (See → Hear → Echo → Build → Use) appears on Today and Practice on both platforms so the "Echo the language" identity is felt beyond `/learn/echo`.

# External Dependencies

- **Authentication**: Clerk (`@clerk/react`, `@clerk/express`)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Payment Processing (Web)**: Stripe SDK
- **Payment Processing (Mobile)**: RevenueCat (`react-native-purchases`)
- **AI Services**: OpenAI (accessed via Replit AI Integrations proxy)
- **CSS Framework**: Tailwind CSS
- **Fonts**: Google Fonts