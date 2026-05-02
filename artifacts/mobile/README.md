# Murciélingo Mobile App

React Native + Expo mobile app for the Murciélingo Spanish learning platform.

## Getting Started in Replit

The app starts automatically when you open the project. To view it:

1. Click the **mobile** artifact in the preview pane dropdown.
2. A QR code appears in the URL bar menu — scan it with **Expo Go** on your phone.
3. Hot Module Reloading (HMR) is enabled — code changes appear instantly.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com) |
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Full URL to the API backend (e.g. `https://domain.repl.co/api`) |

Both variables are automatically injected by Replit's workflow in development — no manual setup needed.

Loaded via `react-native-dotenv` (Babel plugin) — values can also be placed in a `.env` file at the project root for local non-Replit development.

## Architecture

```
artifacts/mobile/
  app/
    _layout.tsx           # Root layout: ClerkProvider + AuthContext + QueryClient
    login.tsx             # Login screen (shown when unauthenticated)
    (tabs)/
      _layout.tsx         # Tab bar with 5 tabs (auth-guarded)
      index.tsx           # Dashboard
      exercises.tsx       # Exercises
      vocabulary.tsx      # Vocabulary
      grammar.tsx         # Grammar
      profile.tsx         # Profile
  components/
    Screen.tsx            # Safe-area scroll wrapper
    AppButton.tsx         # Shared button with haptics
    AppTextInput.tsx      # Input with label, error, password toggle
    Typography.tsx        # Text with semantic variants
    ErrorBoundary.tsx     # App-level crash recovery
  contexts/
    AuthContext.tsx        # Clerk auth, profile loading, API token injection
  lib/
    api.ts                # REST client (fetch + Bearer token from Clerk)
    storage.ts            # AsyncStorage helpers + Clerk token cache
  constants/
    colors.ts             # Brand palette synced with web app
  global.css              # Tailwind/NativeWind directives
  tailwind.config.js      # NativeWind + brand color tokens
  metro.config.js         # withNativeWind Metro transform
  babel.config.js         # nativewind/babel + react-native-dotenv plugins
```

## Authentication

The mobile app uses **Clerk** (same Clerk instance as the web app) for authentication. Phase 2 covers the full unauthenticated user journey:

### Auth screens

| Route | Purpose | Clerk APIs used |
|---|---|---|
| `app/login.tsx` | Email + password sign-in, OAuth, links to register/forgot | `useSignIn().signIn.create` → `setActive` |
| `app/register.tsx` | Email + password + display name + OAuth | `useSignUp().signUp.create({ firstName })` → `prepareEmailAddressVerification` |
| `app/verify-email.tsx` | 6-digit OTP entry with resend (30s cooldown) | `attemptEmailAddressVerification` → `setActive`; `prepareEmailAddressVerification` for resend |
| `app/forgot-password.tsx` | Send reset code to email | `signIn.create({ strategy: "reset_password_email_code" })` |
| `app/reset-password.tsx` | OTP + new password | `signIn.attemptFirstFactor({ strategy: "reset_password_email_code" })` → `setActive` |

The reset-password flow auto-recovers if the in-memory `SignIn` resource is missing the first-factor (e.g. after an app restart): when `attemptFirstFactor` fails and the email is known, `AuthContext.completeResetPassword` re-creates the reset flow and retries once.

### OAuth (Google / Apple)

Both Login and Register expose Google and Apple buttons. Implementation uses Clerk's Expo `useSSO` hook:

```ts
const { startSSOFlow } = useSSO();
const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });
if (createdSessionId && setActive) await setActive({ session: createdSessionId });
```

`expo-web-browser`'s `maybeCompleteAuthSession()` is invoked at module load in `AuthContext.tsx` so the in-app browser closes cleanly after the OAuth redirect.

### Token injection

- `AuthContext` registers a token getter via `setAuthTokenGetter` in `lib/api.ts`.
- The getter calls `session.getToken()` from Clerk on each request.
- The Clerk session JWT is sent as `Authorization: Bearer <token>` to the API.
- The backend validates the JWT via Clerk middleware — no separate mobile auth endpoint needed.
- Token persistence is handled by Clerk's `tokenCache` backed by `AsyncStorage` (see `lib/storage.ts`).

### Auth routing

- `app/_layout.tsx` registers all auth routes in the root `Stack` and waits for Clerk to load before rendering. It does **not** force-redirect unsigned users — that would block navigation between the public auth screens.
- `app/(tabs)/_layout.tsx` is the actual auth gate: unsigned users hitting any protected tab are redirected to `/login`.
- Already-signed-in users hitting `/login`, `/register`, `/verify-email`, or `/reset-password` are redirected to `/(tabs)` from inside those screens.

### Clerk Dashboard checklist

Before testing on a real device, confirm these are enabled in the [Clerk Dashboard](https://dashboard.clerk.com) for the same instance the web app uses:

1. **Email + password sign-in** — required for all flows above.
2. **Email verification code** — User & Authentication → Email, Phone, Username → enable "Verification code".
3. **Reset password via code** — User & Authentication → Email, Phone, Username → enable password reset → choose "Email verification code" (not link).
4. **Google OAuth** and **Apple OAuth** — User & Authentication → Social Connections → enable each provider and configure redirect URIs.
5. **First name attribute** enabled (used as display name during sign-up).

### Simulator vs real device caveats

- **OAuth on iOS Simulator**: Apple Sign-In requires a real device — the simulator will surface "Sign in with Apple is not available". Google works in the simulator but requires Safari to be signed into a Google account.
- **OAuth on Android Emulator**: Apple Sign-In is hidden on Android (we surface "Apple Sign-In is not available on Android" if invoked). Google works in the emulator.
- **Email delivery**: Clerk's dev instance has rate limits — verification and reset emails may take 5–30 seconds to arrive and may land in spam.
- **Deep links / OAuth redirects**: in Replit's Expo Go preview, the OAuth callback returns to the in-app browser and Clerk completes the flow there; no custom URL scheme is required for development. Standalone EAS builds will need a custom URL scheme registered in `app.json` and matching redirect URIs in the Clerk Dashboard (handled in Phase 5).

### Phase 3 recommendations

- Surface the registered display name on the Profile screen (it currently falls back to Clerk `firstName` then to the email prefix).
- Show a "verify your email" banner if a signed-in user has an unverified primary email address.
- Consider migrating profile fetch from `AuthContext` into a dedicated `useProfile` query hook backed by React Query so screens can react to invalidations directly.

## Styling

The app uses **NativeWind v4** (Tailwind CSS for React Native) alongside `StyleSheet` for fine-grained control. Brand tokens are defined in:

- `tailwind.config.js` — Tailwind color aliases matching the web app palette
- `constants/colors.ts` — JS color tokens for use with `StyleSheet` and the `useColors()` hook

## API Client

`lib/api.ts` is a fetch-based REST client:

- Reads base URL from `process.env.EXPO_PUBLIC_API_BASE_URL` (set to `https://$REPLIT_DEV_DOMAIN/api` in dev)
- Injects `Authorization: Bearer <token>` via the token getter set from `AuthContext`
- Covers profile, streaks, progress, vocabulary, and contact endpoints

## What Has Been Built (Phase 4 — Beta Polish)

Phase 4 hardens the app for an internal Expo Go beta. No new screens — just resilience, persistence, and feedback polish.

### Persistence (`lib/storage.ts`)

| Helper | Purpose |
|---|---|
| `recentLessons.add/get` | Remembers the last 10 lessons + reading passages a user opened (FIFO, deduped). Surfaced on the Dashboard as a "Pick up where you left off" row. |
| `dashboardCache.get/set` | Caches the dashboard payload (streak, progress, vocab count, last activity) for 5 minutes so the dashboard renders instantly on re-open instead of showing a spinner. |
| `exerciseDraft.get/set/clear` | Per-exercise draft slot for resuming a partially answered question across navigation pops. Reserved for future Phase 5 use. |

All storage helpers are try/catch wrapped — a corrupt or unwritable AsyncStorage entry never crashes the app.

### Offline detection (`components/OfflineBanner.tsx`)

A red banner slides down from the top of every screen when `@react-native-community/netinfo` reports no connectivity (or no internet reachability). It auto-hides when the connection returns. Mounted in `app/_layout.tsx` so it overlays both the auth flow and the tabbed app.

### Post-exercise feedback

| Behavior | Where |
|---|---|
| Haptic success / error pulse on each answer | `app/lesson/[id].tsx`, `app/passage/[id].tsx` (`Haptics.notificationAsync`) |
| Animated count-up of the final score | `components/AnimatedScore.tsx` (eased over 700 ms with `requestAnimationFrame`) |
| Encouragement copy keyed to the score range | `lib/encouragement.ts` (5 buckets: 90+ / 75+ / 60+ / 40+ / <40, both `sv` and `en`) |
| Extra success haptic when score ≥ 80 % | Lesson + passage finish handlers |

### Beta test checklist

Use this checklist when smoke-testing the app in Expo Go before sharing a build with beta users.

**Auth flow**
- [ ] Sign up with a new email — receive verification code, enter it, land on the Dashboard.
- [ ] Log out from Profile, log back in with the same credentials.
- [ ] Use Forgot password — receive reset code, set a new password, log in with it.
- [ ] Sign in with Google (real device or Safari-signed simulator).
- [ ] Sign in with Apple (real iOS device only).

**Navigation**
- [ ] Each of the 5 tabs (Dashboard, Exercises, Vocabulary, Grammar, Profile) loads without error.
- [ ] From Dashboard, tap a quick action → reach Flashcards / Exercises / Reading / Vocabulary.
- [ ] From Dashboard, tap "View stats" → Stats screen renders.
- [ ] From Profile → "View detailed stats" → Stats screen renders.
- [ ] Open a grammar lesson, complete the practice → result screen shows animated score and encouragement.
- [ ] Open a reading passage, complete the quiz → result screen shows animated score and encouragement.
- [ ] Hardware back button returns to the previous screen on Android.

**Persistence**
- [ ] Open two grammar lessons or reading passages — Dashboard "Pick up where you left off" shows them.
- [ ] Force-close the app and reopen — recent items survive.
- [ ] Reopen the Dashboard within 5 minutes — it appears instantly without a spinner (cached).

**Offline graceful degradation**
- [ ] Enable airplane mode while inside the app — red "You're offline" banner appears.
- [ ] Disable airplane mode — banner disappears.
- [ ] Tap a screen that fetches data while offline — `ErrorState` renders with a Retry button (no crash, no white screen).

**Visual QA**
- [ ] iPhone SE / small device: nothing is clipped, status bar is respected.
- [ ] iPhone 14 Pro / dynamic island device: header content stays clear of the island.
- [ ] Android (Pixel-class): tab bar text is fully visible, no truncation.
- [ ] Light + dark system theme: brand colors stay readable in both.

**Known limitations (intentional for beta)**
- Grammar lessons + reading passages are seeded from `lib/mockContent.ts` (one lesson per CEFR level, A1–B2 reading). API-backed content is the next phase.
- Flashcards fall back to an 8-card seed deck when the user has no saved vocabulary.
- Sentence-builder, conversation, and pronunciation exercises listed in the web app are not yet ported.

## What Has Been Built (Phase 3)

Phase 3 ports the web app's core product surfaces to React Native. Every new screen uses the shared UI primitives (`Card`, `ProgressBar`, `EmptyState`, `LoadingState`, `ErrorState`) and consistent loading / error handling.

### Screens shipped

| Screen | Route | Data source | Notes |
|---|---|---|---|
| Dashboard | `/(tabs)/` | live: streaks, progress, vocabulary | Streak card, "Continue learning" resume card, progress bars, quick actions. Pull-to-refresh. |
| Exercises hub | `/(tabs)/exercises` | navigation only | Card grid linking to Grammar, Reading, Flashcards, Vocabulary. |
| Vocabulary | `/(tabs)/vocabulary` | live: vocabulary | Search + filter (all / learning / learned). Empty state with CTA to Exercises. |
| Word detail | `/word/[id]` | live: vocabulary | Mark learned/learning, remove from dictionary. |
| Flashcards (SRS) | `/flashcards` | live: vocabulary + flashcardSrs (mock seeds when empty) | SM-2-style scheduling in `lib/srs.ts`. Persists ratings via `/flashcard-srs`. Falls back to seed cards from `lib/mockContent.ts` when the user has no saved vocab yet. |
| Grammar | `/(tabs)/grammar` | mock content + live progress | Lessons grouped by CEFR (A1–C2). Per-lesson `bestScore` / `attempts` from `/grammar-progress`. |
| Lesson detail | `/lesson/[id]` | mock content + live progress | Learn → multiple-choice practice → result. ≥80% saves as completed. |
| Reading | `/(tabs)/reading` | mock content | Hidden from the tab bar (accessed from Dashboard / Exercises). Passages grouped by level. |
| Passage detail | `/passage/[id]` | mock content | Spanish text, optional translation, comprehension quiz with scoring. |
| Stats | `/stats` | live: streaks + progress + vocabulary | 7-day activity grid, category progress bars, vocab mastery circular progress. Reachable from Dashboard + Profile. |
| Profile | `/(tabs)/profile` | live: profile | Editable display name, level (A1–C2), learning language (sv/en). All persisted via `/profile`. |

### Navigation

- Tabs (5): Dashboard · Exercises · Vocabulary · Grammar · Profile.
- Reading lives in `(tabs)/reading.tsx` but is hidden from the tab bar via `href: null` and surfaced from Dashboard quick actions and the Exercises hub.
- Stack routes registered in `app/_layout.tsx`: `flashcards`, `stats`, `lesson/[id]`, `passage/[id]`, `word/[id]`.

### Shared UI kit

| Component | Purpose |
|---|---|
| `Card` | Surface container with `default` / `muted` / `primary` / `outline` variants and optional `onPress` (haptic). |
| `ProgressBar` | Linear progress with optional label, plus `CircularProgress` for ring-style displays. |
| `EmptyState` | Illustrated empty list / zero-state with optional action button. |
| `LoadingState` | Inline or full-screen spinner with optional label. |
| `ErrorState` | Error display with retry button. |

### Remaining gaps (TODO)

These are flagged with `TODO(api)` in source and currently use seed data in `lib/mockContent.ts`:

- **Grammar lessons** — no `/grammar-lessons` endpoint yet. Content is hard-coded for A1, A2, B1, B2, C1, C2 (one lesson per level). Per-lesson **progress** (completed flag, best score, attempts) IS live via `/grammar-progress`.
- **Reading passages** — no `/reading-passages` endpoint. A1, A2, B1, B2 each have one seeded passage with comprehension questions.
- **Flashcard seed deck** — when the user has zero saved vocabulary, the Flashcards screen serves a small seed deck (8 A1–A2 cards) so a session is still possible. Real saved vocab fully overrides the seeds; SRS state persists either way for non-seed cards.
- **Sentence builder, conversation, pronunciation exercises** — listed in the web app, intentionally not in Phase 3 scope.

## What Has Been Built (Phase 2)

- ✅ Sign-up screen with display name, email, password (strength rules), confirm password, and OAuth
- ✅ Email verification screen with resend (30 second cooldown) and inline status messaging
- ✅ Forgot password screen — sends Clerk reset code via email
- ✅ Reset password screen — accepts code + new password with auto-recovery if the SignIn resource lost state
- ✅ Google and Apple OAuth on both Login and Register via `useSSO`
- ✅ Cross-screen navigation (login ↔ register, login → forgot, forgot → reset, verify → resend)
- ✅ Public auth routes are reachable when signed out; only protected tabs are auth-gated

## What Has Been Built (Phase 1)

- ✅ Expo Router file-based navigation
- ✅ 5-tab navigation shell: Dashboard, Exercises, Vocabulary, Grammar, Profile
- ✅ Login screen with email/password and error handling
- ✅ Auth gate: unauthenticated users see Login, authenticated users see tabs
- ✅ Clerk auth with `setActive()` to properly establish session after sign-in
- ✅ API client wired to `EXPO_PUBLIC_API_BASE_URL` with Bearer token
- ✅ NativeWind v4 + Tailwind CSS configured
- ✅ react-native-dotenv configured for .env file support
- ✅ Shared components: `Screen`, `AppButton`, `AppTextInput`, `Typography`
- ✅ Brand colors synced from web app (sand/peach/sage palette)
- ✅ Native tab bar with liquid glass on iOS 26+ (falls back to BlurView)
- ✅ EAS-compatible `eas.json` stub
- ✅ Environment variable documentation

## Running Locally (outside Replit)

```bash
cp .env.example .env
# edit .env with your Clerk key and API URL

# From workspace root
pnpm --filter @workspace/mobile run dev
```
