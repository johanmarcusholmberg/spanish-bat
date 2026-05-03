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
- **API Design**: RESTful API built with Express, secured with Clerk JWT verification middleware.
- **Database Schema**: Comprehensive schema covering user profiles, progress, streaks, vocabulary, spaced repetition, and a detailed subscription system.
- **Subscription Model**: Implemented with a flexible `SubscriptionModel` supporting Free/Premium tiers, managed through a shared `@workspace/subscription` package. Integrates with Stripe for web and RevenueCat for mobile in-app purchases.
- **AI Integration**: Uses OpenAI via Replit AI Integrations proxy for features like translation and conversational practice.
- **Weak-Spot Tracking**: A shared mechanism to identify and prioritize subskills needing practice based on user performance (accuracy, confidence, repetition).
- **Level Check**: A non-blocking assessment system (`@workspace/level-check`) to evaluate user proficiency (e.g., A1, A2) and recommend next steps.
- **Persisted Practice Items Library**: AI-generated practice items are stored in a database, approved, and reused, reducing redundancy and improving content quality. Includes PII filtering for AI-generated content.
- **Spaced Repetition System (SRS)**: An SM-2-lite based scheduler implemented in `lib/practice/src/srs.ts` to optimize review timing for vocabulary and concepts. It integrates with user practice statistics and guides daily review recommendations.
- **Mobile Development**: Uses Expo and React Native, ensuring a consistent experience with the web app, with specific adaptations for mobile platform features (e.g., RevenueCat for subscriptions). Mobile routing is handled by Expo Router.
- **Mobile-Native Polish Surfaces (Phase 24)**: Builds on the Phase 23 foundations to ship the user-visible Echo / onboarding / notifications surfaces:
  - `app/welcome.tsx` — first-session onboarding screen explaining the Echo method and ending with a single CTA: "Start your first 3-minute practice." Verify-email now lands brand-new accounts here instead of the dashboard.
  - `components/EchoRecorder.tsx` — reusable Echo step UI that asks for mic permission contextually via `useMicrophonePermission`, records on supported platforms, and *always* exposes manual confidence buttons so it stays usable when recording isn't available. Hooks into `learningFeedbackService` for haptics.
  - `app/learn/echo.tsx` — focused 5-phrase Echo session using `EchoRecorder` and the `EchoSteps` strip, accessible from the onboarding/Today flows.
  - `expo-notifications` installed; `lib/notificationScheduler.ts` now schedules real daily / weekly local reminders (daily practice, weak words, streak, level readiness, weekly summary) governed by `notificationPreferenceService`. Web stays a safe no-op.
  - `components/NotificationPreferences.tsx` — opt-in Profile section that prompts the OS only when the user toggles the master switch, and reconciles scheduled reminders whenever a category or preferred hour changes.
  - Today screen now reads from `learningCacheService` (level + progress summary) when no fresh dashboard cache exists, and mirrors level + progress back into the cache after every successful fetch — closing the offline loop.
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