# Murciélingo Mobile — Release Checklist

A pre-flight checklist for shipping `@workspace/mobile` to the **Apple App Store** and **Google Play Store**. Work top-to-bottom; each section is gated on the one above it.

Scope: this covers what we control inside the repo (code, app config, EAS config) plus the manual store-console steps you have to do by hand. Anything still tracked as `TODO_…` in `app.json` / `eas.json` is called out below.

---

## 0. Phase 6 verification (already done in this phase)

- [x] `pnpm --filter @workspace/mobile run typecheck` passes with zero errors.
- [x] No remaining Supabase references — auth and data go through Clerk + the `@workspace/api-server`.
- [x] `app/index.tsx` exists and routes signed-out users to `/login` and signed-in users to `/(tabs)`.
- [x] All routes registered in `app/_layout.tsx` (`index`, `(tabs)`, `login`, `register`, `verify-email`, `forgot-password`, `reset-password`, `flashcards`, `stats`, `lesson/[id]`, `passage/[id]`, `word/[id]`).
- [x] `(tabs)/_layout.tsx` uses native tabs (Liquid Glass) on iOS 17+ and falls back to classic tabs elsewhere.
- [x] `RequireAuth`, `ErrorBoundary`, `OfflineBanner`, persisted Clerk token cache, and `dashboardCache` are all wired up.
- [x] `AsyncStorage` writes are wrapped in try/catch with a single `console.warn` per failure (no console noise during the happy path).
- [x] Web app (`@workspace/murcielingo`) still renders the login screen (verified via screenshot).

> Known dev-only cosmetic: the **web preview** of the mobile artifact in Replit shows Expo's "Welcome to Expo" placeholder because `(tabs)/_layout.tsx` imports native-only modules (`expo-router/unstable-native-tabs`, `expo-glass-effect`, `expo-symbols`). This does **not** affect Expo Go, iOS, or Android — it is purely the desktop browser preview. Test on a device or simulator instead.

---

## 1. Code & content cleanup

- [x] **In-app account deletion.** `DELETE /api/profile` wipes all user-owned rows and deletes the Clerk user; Profile screen exposes a "Delete account" button with double confirmation that calls it and signs out. Satisfies App Store guideline 5.1.1(v) and Google Play account-deletion policy.
- [x] **Privacy / Terms / Support links surfaced in-app.** Profile → Account section opens Privacy Policy, Terms of Service, and Contact Support via in-app browser. URLs read from `expo.extra._storeMetadataTodos` in `app.json` with safe public fallbacks (`https://murcielingo.app/...`).
- [x] **Empty-state copy.** Grammar and Reading screens use neutral copy ("Try a different level above — we're adding new passages regularly") instead of "coming soon".
- [ ] **Replace mock content with API endpoints.** `lib/mockContent.ts` still ships hard-coded grammar lessons, reading passages, and flashcard decks. Tracked by **Task #49** ("Move grammar lessons & reading passages from mobile mock content into the API") and **Task #50** ("Expand grammar lesson and reading passage library beyond one item per level"). Either ship those tasks first or document in App Review notes that the beta library is intentionally small.
- [ ] **End-to-end test coverage.** Tracked by **Task #51** ("Cover the new mobile screens with end-to-end tests"). Make sure it lands green before tagging a build.
- [ ] **Manual smoke test on a real device** (iPhone + Android phone):
  - [ ] Cold start → login screen renders, no flash of the wrong screen.
  - [ ] Email + password sign-up → 6-digit OTP → lands on dashboard.
  - [ ] Email + password sign-in.
  - [ ] Google OAuth sign-in.
  - [ ] Apple OAuth sign-in (iOS only — required for App Store if any other social login is offered).
  - [ ] Forgot password → email code → reset → auto sign-in.
  - [ ] Dashboard loads streak, progress, vocab count; pull-to-refresh works.
  - [ ] Exercises tab → start a lesson → complete it → progress updates on dashboard.
  - [ ] Grammar tab → open a lesson → complete an exercise.
  - [ ] Reading passage → tap word → save to vocabulary.
  - [ ] Vocabulary tab → search filters results.
  - [ ] Flashcards screen → review session updates SRS state.
  - [ ] Stats screen renders streaks + activity log.
  - [ ] Profile tab → edit display name → sign out → returns to login.
  - [ ] Force-quit and re-open while signed in → lands on dashboard without re-auth (Clerk token cache).
  - [ ] Toggle airplane mode → `OfflineBanner` appears; cached dashboard still readable.
- [ ] **Screen-size sweep.** Verify on the smallest supported device (iPhone SE / 5.4" Android) and a tablet-sized phone (iPhone 16 Pro Max / Pixel 9 Pro XL). All scrollable screens should not clip the tab bar; all CTAs should be reachable above the keyboard.

---

## 2. App config (`app.json`) — must be set before EAS build

- [ ] `expo.owner` — currently `"TODO-expo-account-username"`. Set to your real Expo account/organization slug.
- [ ] `expo.extra.eas.projectId` — currently `"TODO_RUN_EAS_INIT_TO_GENERATE_PROJECT_ID"`. Run `eas init` once and commit the generated value.
- [ ] `expo.version` — bump for each store release (e.g. `1.0.0` → `1.0.1`).
- [ ] `expo.ios.buildNumber` — bump on every TestFlight/App Store upload.
- [ ] `expo.android.versionCode` — increment integer on every Play upload.
- [ ] `expo.ios.bundleIdentifier` (`app.murcielingo.mobile`) and `expo.android.package` (`app.murcielingo.mobile`) — confirm these are reserved in App Store Connect and Google Play Console before the first upload (they cannot be changed later).
- [ ] Real splash + store icon assets — currently `assets/images/splash.png` and `assets/images/icon.png` are placeholders. Tracked by **Task #52** ("Add real splash and store-ready icon artwork before app submission"). Required:
  - iOS icon: 1024×1024 PNG, no alpha, no rounded corners.
  - Android adaptive icon: foreground 1024×1024 PNG with transparency.
  - Splash: 1242×2436 (or larger square 2048×2048), background `#D9CFBC`.
- [ ] Replace the `_storeMetadataTodos` block in `app.json` with real values (or move the URLs into the store consoles directly):
  - `privacyPolicyUrl` — public URL. Tracked by **Task #53** ("Publish a public Privacy Policy and Terms of Service page").
  - `termsOfServiceUrl` — public URL.
  - `supportEmail` — monitored mailbox.

---

## 3. EAS config (`eas.json`) — must be set before `eas submit`

- [x] `preview` and `production` build profiles are defined with `channel`, platform-specific build settings (`apk` for preview Android, `app-bundle` for production), and `env` blocks for `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. The env values are still `TODO_…` placeholders — fill in before running `eas build`.


- [ ] iOS submit block (`submit.production.ios`):
  - [ ] `appleId` — Apple ID email with App Store Connect access.
  - [ ] `ascAppId` — App Store Connect App ID (the numeric one from App Information).
  - [ ] `appleTeamId` — 10-char Apple Developer Team ID.
  - [ ] `ascApiKeyPath` — path to your downloaded `.p8` (do **not** commit; keep in `~/.eas/` and gitignore).
  - [ ] `ascApiKeyId` and `ascApiKeyIssuerId` — from App Store Connect → Users & Access → Keys.
- [ ] Android submit block (`submit.production.android`):
  - [ ] `serviceAccountKeyPath` — Play Console service account JSON (do **not** commit).
  - [ ] Confirm `track: "internal"` for first upload, then move to `closed` (alpha/beta) before `production`.

---

## 4. Backend & secrets

- [ ] Production Clerk instance is **not** the same as the dev `pk_test_*` key (the dev console warning will block production sign-in volume). Switch to `pk_live_*` and set:
  - [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (build-time env in EAS).
  - [ ] `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` on the deployed API server.
- [ ] `EXPO_PUBLIC_API_BASE_URL` points at the **deployed** API domain (e.g. `https://api.murcielingo.app/api`), not a Replit dev URL. Set this in `eas.json → build.production.env`.
- [ ] API server is deployed and reachable over HTTPS from outside Replit.
- [ ] Clerk dashboard has the production redirect URLs whitelisted (`murcielingo://`, plus any web callbacks).
- [ ] Postgres for prod is sized appropriately and backed up.
- [ ] `OPENAI` / `AI_INTEGRATIONS_OPENAI_*` secrets are present on the deployed API server (used by `/api/ai/translate` and `/api/ai/conversation`).

---

## 5. Build & internal testing

- [ ] `eas build --profile preview --platform ios` and `--platform android` succeed.
- [ ] Install the preview build on a physical device via TestFlight (iOS) and Internal App Sharing / Internal Testing track (Android).
- [ ] Run the manual smoke test from §1 on the preview build (not just dev).
- [ ] Verify deep-link scheme `murcielingo://` returns to app from OAuth.
- [ ] Verify push notifications, location, camera, and any other permissions are **not** requested unless actually used (right now we use none — keep it that way unless a feature needs it).

---

## 6. Store metadata & assets (Task #54 covers screenshots)

- [ ] App name: **Murciélingo**.
- [ ] Subtitle / short description (≤30 char iOS / ≤80 char Android).
- [ ] Long description — emphasize: bite-sized Spanish lessons, real reading passages, spaced-repetition flashcards.
- [ ] Keywords (iOS): spanish, learn spanish, language, flashcards, reading.
- [ ] Category: Education (primary).
- [ ] Age rating: 4+ (iOS) / Everyone (Android), assuming all content stays G-rated.
- [ ] Screenshots — **required sizes**:
  - iOS: 6.9" (iPhone 16 Pro Max) and 6.5" (iPhone 14 Plus) — at least 3 each.
  - Android: phone (1080×1920+) — at least 2; optional 7" and 10" tablet.
  - Tracked by **Task #54** ("Capture App Store and Google Play screenshots from a production build").
- [ ] App preview video (optional but recommended for iOS) — 15–30s.
- [ ] Privacy Policy URL (public, hosted; from §2). Required by both stores.
- [ ] Support URL (can be same as marketing site).
- [ ] Marketing URL (optional).

---

## 7. App Store Review (iOS) — extra requirements

- [ ] **Sign in with Apple** is enabled on the Apple Developer account capabilities for this bundle ID, since we offer Google sign-in (Apple requires Apple SSO when any third-party SSO is offered).
- [ ] App Privacy questionnaire filled out in App Store Connect:
  - [ ] Email address — collected, linked to user, used for app functionality + account management.
  - [ ] Name — collected (display name), linked to user.
  - [ ] User content — saved vocabulary, lesson progress, flashcard reviews.
  - [ ] No third-party tracking.
- [ ] Demo account credentials provided in App Review notes (Reviewer login).
- [ ] App Review notes include: "Beta lesson library is intentionally limited; full content is server-driven and being expanded."

---

## 8. Google Play Review (Android) — extra requirements

- [ ] Data safety form completed (mirrors the iOS App Privacy answers).
- [ ] Target API level meets Play's current floor (Android 14 / API 34 as of 2024+; Expo SDK 54 already targets this).
- [ ] Content rating questionnaire submitted.
- [ ] App access — supply test credentials; mark "All functionality is available without special access" only after confirming.
- [ ] Closed testing track has at least 12 testers running for 14 consecutive days before promoting to production (Play's new requirement for personal accounts).

---

## 9. Submission

- [ ] iOS: `eas submit --platform ios --profile production` → wait for App Store Connect processing → submit for review.
- [ ] Android: `eas submit --platform android --profile production` → promote build from internal → closed → production in Play Console.
- [ ] Tag the release in git: `git tag mobile-v1.0.0 && git push --tags`.
- [ ] Update `replit.md` with the released version and store URLs.

---

## 10. Post-launch

- [ ] Monitor Clerk dashboard for sign-up errors.
- [ ] Monitor API server logs for 5xx spikes.
- [ ] Watch App Store Connect + Play Console for crash reports.
- [ ] Have a hotfix branch + EAS update channel ready for OTA fixes (`eas update --channel production`) where possible.

---

## Open project tasks blocking final submission

These were proposed during earlier phases and should be reviewed before tagging v1.0.0:

| Task | Blocker? | Notes |
|---|---|---|
| #45 — Mobile Phase 4 polish | Soft | Polish only; not strictly blocking. |
| #49 — Move grammar/reading content to API | Yes | Reviewer-visible; ship before launch or document in App Review notes. |
| #50 — Expand content library | Soft | Can ship as a content-only update post-launch via the API. |
| #51 — End-to-end tests for new screens | Yes | Should be green before any production build. |
| #52 — Real splash + store icon | **Yes** | Both stores reject placeholder art. |
| #53 — Privacy Policy + ToS pages | **Yes** | Required URL fields in both store consoles. |
| #54 — Store screenshots | **Yes** | Required for store listing. |
