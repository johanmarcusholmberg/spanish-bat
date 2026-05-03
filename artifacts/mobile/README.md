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
| `EXPO_PUBLIC_RC_IOS_API_KEY` | For iOS purchases | RevenueCat **public** Apple SDK key from RC dashboard → Project settings → API keys |
| `EXPO_PUBLIC_RC_ANDROID_API_KEY` | For Android purchases | RevenueCat **public** Android SDK key |
| `EXPO_PUBLIC_RC_ENTITLEMENT_ID` | Recommended | RevenueCat entitlement identifier (default `premium`) |
| `EXPO_PUBLIC_RC_PRODUCT_MONTHLY` | Recommended | Apple/Google product id for monthly Premium (placeholder until store products exist) |
| `EXPO_PUBLIC_RC_PRODUCT_YEARLY` | Recommended | Apple/Google product id for yearly Premium (placeholder until store products exist) |

Both Clerk variables are automatically injected by Replit's workflow in development — no manual setup needed. RevenueCat keys must be set manually in Replit Secrets before in-app purchases work; without them the paywall shows a friendly "in-app purchases aren't enabled in this build" message and free access continues unchanged.

The API server also reads two RevenueCat env vars (server-side, no `EXPO_PUBLIC_` prefix):

| Variable | Required | Description |
|---|---|---|
| `REVENUECAT_WEBHOOK_AUTH` | For webhook | Shared secret you paste into RC dashboard → Project → Integrations → Webhooks → Authorization header. Without it, `/api/revenuecat/webhook` returns 503 (fail-closed). |
| `RC_PRODUCT_MONTHLY` / `RC_PRODUCT_YEARLY` | Optional | Same product ids as the mobile vars — used by the webhook to map `product_id` → internal `planId`. If unset, the sync falls back to a name heuristic (`premium|pro` → premium). |

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

### Auth recommendations

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

## App Store / Play Store Release (Phase 5 — Prep Only)

This section captures everything needed to take the mobile app from beta-in-Expo-Go to a production release on the App Store and Google Play. **Nothing in this repo submits the app** — these are the manual steps and the release-readiness checklist that must be ticked off first.

The branded bat icon (`assets/images/icon.png`) is final-quality. The current `assets/images/splash.png` is a placeholder copy of the icon — replace it with a real **1284×2778 portrait splash** before shipping production builds.

### Required accounts

| Account | Cost | Purpose | Where to sign up |
|---|---|---|---|
| **Expo** | Free | Hosts the EAS build pipeline; needed to run any `eas build` / `eas submit` | <https://expo.dev/signup> |
| **Apple Developer Program** | $99 / year | Required to publish on the App Store | <https://developer.apple.com/programs/> |
| **Google Play Console** | $25 one-time | Required to publish on Google Play | <https://play.google.com/console/signup> |

Once those exist, bootstrap EAS from the mobile artifact root:

```bash
cd artifacts/mobile
pnpm exec eas login            # authenticates the Expo CLI
pnpm exec eas init             # creates a project on Expo and writes the projectId into app.json → extra.eas.projectId
```

After `eas init` runs, replace the placeholder string `TODO_RUN_EAS_INIT_TO_GENERATE_PROJECT_ID` in `app.json` with the real UUID it generates (the CLI does this automatically; verify it landed in `extra.eas.projectId`).

### Manual setup checklist

These items live outside the code in third-party consoles. They must be done by the project owner before a production build will work end-to-end.

- [ ] **Clerk production instance** — create a separate production instance in the [Clerk Dashboard](https://dashboard.clerk.com), enable email/password sign-up, and toggle on Google + Apple OAuth providers.
- [ ] **Swap to production Clerk publishable key** — replace `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (currently `pk_test_*`) with the production `pk_live_*` key in EAS secrets (`eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value pk_live_...`).
- [ ] **Clerk OAuth redirect URLs** — in Clerk → User & Authentication → Social Connections, register `murcielago://oauth-native-callback` as an allowed redirect URL for both Google and Apple.
- [ ] **Production API base URL** — point `EXPO_PUBLIC_API_BASE_URL` at the deployed API server (the Replit deployment URL once the API is published), not the dev domain.
- [ ] **Privacy Policy URL** — host a public privacy policy and put the URL into `app.json → extra._storeMetadataTodos.privacyPolicyUrl`, plus the App Store Connect and Google Play Console listing pages. Both stores reject submissions without one.
- [ ] **Terms of Service URL** — same pattern; required by the App Store Review Guidelines once any user-generated content or accounts exist.
- [ ] **Support email** — public email address shown on both store listings; add to `app.json → extra._storeMetadataTodos.supportEmail`.
- [ ] **App Store screenshots** — capture in the iOS Simulator or use Rotato / Previewed; required sizes:
  - 6.9″ (iPhone 16 Pro Max) — 1320×2868
  - 6.5″ (iPhone 11 Pro Max) — 1242×2688
  - 5.5″ (iPhone 8 Plus) — 1242×2208
- [ ] **App Store description copy** — short subtitle (≤ 30 chars) and full description (≤ 4000 chars), keywords (≤ 100 chars), promotional text (≤ 170 chars).
- [ ] **App Store Review demo credentials** — create a sample beta account (email + password) and put the credentials into App Store Connect → App Review Information so Apple's reviewers can sign in.
- [ ] **Google Play listing assets**:
  - Feature graphic: 1024×500 PNG/JPG
  - At least 2 phone screenshots (recommended 8): 1080×1920 or higher
  - Short description: ≤ 80 chars
  - Full description: ≤ 4000 chars
  - High-res icon: 512×512 (Play Store auto-generates from `adaptiveIcon.foregroundImage`)
- [ ] **Content rating questionnaires** — complete the IARC questionnaire in Google Play Console and the App Store age-rating form in App Store Connect.
- [ ] **Create the App Store Connect app record** — in App Store Connect → Apps → +, create a new app with bundle ID `app.murcielago.mobile` **before** running any submit. The `ascAppId` you put in `eas.json` comes from this record's URL.
- [ ] **Create the Google Play app record** — in Play Console → Create app, with package name `app.murcielago.mobile`, **before** running any submit.
- [ ] **Apple Team ID + ASC App ID** — fill the `submit.production.ios` block in `eas.json` with your real `appleId`, `ascAppId`, and `appleTeamId`.
- [ ] **App Store Connect API key (required for non-interactive iOS submit)** — in App Store Connect → Users and Access → Integrations → App Store Connect API, create a key with the **App Manager** role, download the `.p8` file (you can only download it once), and add three fields to `eas.json → submit.production.ios`:
  - `ascApiKeyPath`: relative path to the downloaded `.p8` (e.g. `./AuthKey_ABCD1234.p8`) — **do not commit this file to git**.
  - `ascApiKeyId`: the Key ID shown in App Store Connect.
  - `ascApiKeyIssuerId`: the Issuer ID shown at the top of the API Keys page.
  Without these, `eas submit ... --non-interactive` for iOS cannot authenticate.
- [ ] **Google Play service account** — generate a service account JSON in Google Cloud Console, grant it Play Console release permissions, save it locally as referenced by `eas.json → submit.production.android.serviceAccountKeyPath`. **Do not commit this JSON to git.**

### Release-readiness checklist

Tick every box before running `eas submit`. Anything unchecked is a likely rejection.

**Accounts and tooling**
- [ ] Expo account created and logged in (`pnpm exec eas whoami` shows your username)
- [ ] `pnpm exec eas init` has run and the real `projectId` is in `app.json → extra.eas.projectId`
- [ ] Apple Developer Program account active (not "pending")
- [ ] Google Play Console account active

**Assets**
- [ ] `assets/images/icon.png` — 1024×1024 branded icon (already in repo)
- [ ] `assets/images/splash.png` — real 1284×2778 portrait splash (currently a placeholder copy of icon.png)
- [ ] All App Store screenshot sizes captured
- [ ] All Google Play screenshots + 1024×500 feature graphic captured

**Configuration**
- [ ] `app.json → extra._storeMetadataTodos.expoOwner` set to a real Expo username
- [ ] `app.json → extra._storeMetadataTodos.privacyPolicyUrl` set to a live public URL
- [ ] `app.json → extra._storeMetadataTodos.termsOfServiceUrl` set to a live public URL
- [ ] `app.json → extra._storeMetadataTodos.supportEmail` set to a real address
- [ ] `eas.json → submit.production.ios` filled with real Apple values (`appleId`, `ascAppId`, `appleTeamId`)
- [ ] `eas.json → submit.production.ios` also has `ascApiKeyPath`, `ascApiKeyId`, `ascApiKeyIssuerId` for non-interactive submit
- [ ] App Store Connect app record exists with bundle ID `app.murcielago.mobile`
- [ ] Google Play app record exists with package `app.murcielago.mobile`
- [ ] `eas.json → submit.production.android.serviceAccountKeyPath` points to a real key file

**Production secrets and endpoints**
- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` swapped to `pk_live_*` in EAS secrets
- [ ] `EXPO_PUBLIC_API_BASE_URL` points at the production deployment, not `replit.dev`
- [ ] Clerk production instance OAuth redirect URLs include `murcielago://oauth-native-callback`

**Legal and store listings**
- [ ] Privacy policy live at the URL in `app.json`
- [ ] Terms of Service live at the URL in `app.json`
- [ ] App Store description copy + keywords + promo text written
- [ ] App Store demo account credentials added to App Review Information
- [ ] Google Play short + full descriptions written
- [ ] Both stores' content/age rating questionnaires completed

**Builds**
- [ ] `pnpm exec eas build --platform ios --profile production` succeeds
- [ ] `pnpm exec eas build --platform android --profile production` succeeds
- [ ] Production build installs and launches cleanly on a real iPhone and a real Android device
- [ ] Sign-up + email verification + login work against the production Clerk instance on both platforms
- [ ] Dashboard, lessons, reading passages, vocabulary, flashcards all load against the production API

**Submission dry-run**
- [ ] `pnpm exec eas submit --platform ios --profile production --non-interactive --dry-run` reviewed
- [ ] `pnpm exec eas submit --platform android --profile production --non-interactive --dry-run` reviewed

When every box above is ticked, drop `--dry-run` to actually submit. Apple review takes 1–3 days; Google review takes a few hours to a few days depending on history.

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
| Grammar | `/(tabs)/grammar` | live `/grammar-lessons` + `/grammar-progress` (offline cache fallback) | Lessons grouped by CEFR (A1–C2), 3 per level. Per-lesson `bestScore` / `attempts` from `/grammar-progress`. |
| Lesson detail | `/lesson/[id]` | live `/grammar-lessons` (offline cache fallback) + live progress | Learn → multiple-choice practice → result. ≥80% saves as completed. |
| Reading | `/(tabs)/reading` | live `/reading-passages` (offline cache fallback) | Hidden from the tab bar (accessed from Dashboard / Exercises). 3 passages per level (A1–C2). |
| Passage detail | `/passage/[id]` | live `/reading-passages` (offline cache fallback) | Spanish text, optional translation, comprehension quiz with scoring. |
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

### Content sources

- **Grammar lessons + reading passages** — canonical content lives in `lib/learning-content/` (a shared workspace package) and is served by the API at `GET /grammar-lessons` and `GET /reading-passages`. The mobile screens fetch via `api.content.*`, cache the response in AsyncStorage (`lib/contentCache.ts`), and fall back to the bundled package as a last resort. Currently 3 lessons per CEFR level (18 total) and 3 passages per level (18 total). Per-lesson **progress** persists via `/grammar-progress`.
- **Flashcard seed deck** — when the user has zero saved vocabulary, the Flashcards screen serves a small seed deck (8 A1–A2 cards from `lib/mockContent.ts`) so a session is still possible. Real saved vocab fully overrides the seeds; SRS state persists either way for non-seed cards.

### Remaining gaps (TODO)

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

## Subscriptions (Phase 10 — RevenueCat / Mobile IAP)

The mobile app uses **RevenueCat** to mediate Apple In-App Purchase and Google Play Billing. Stripe is web-only — Apple's policy forbids using Stripe Checkout inside the iOS app for digital subscriptions.

### What's wired up in code

- **SDK**: `react-native-purchases` (works in Expo Go via Preview API Mode — no native build needed for development).
- **Service**: `lib/revenuecat.ts` — `initRevenueCat`, `identifyUser`, `getCurrentOffering`, `purchasePackage`, `restorePurchases`, `getCustomerInfo`.
- **Config**: `lib/revenuecatConfig.ts` reads the `EXPO_PUBLIC_RC_*` env vars listed above. Defaults are placeholder product ids so the code typechecks and runs without a real RC project.
- **Hook**: `hooks/useSubscription.ts` initialises RC on auth load, identifies the customer with the Clerk user id, then fetches the canonical entitlement view from `GET /api/subscription`. The API view is the source of truth for gating; RC is the source of truth for *purchasing*.
- **Paywall**: `app/paywall.tsx` (modal route). Renders the current RC offering with monthly + yearly choices, a "Restore purchases" button, and a "Premium feature aren't enabled" fallback when RC isn't configured.
- **Components**: `components/PremiumBadge.tsx`, `components/LockedFeature.tsx` (drop into any screen — `LockedFeature` deep-links to `/paywall`).
- **Server webhook**: `POST /api/revenuecat/webhook` (in `@workspace/api-server`) authenticated by the shared secret in `REVENUECAT_WEBHOOK_AUTH`. Maps RC events → the existing `user_subscriptions`, `user_entitlements`, `subscription_events`, `customer_mapping` tables. Same plan-source semantics as Stripe (deletes all `plan:%` rows, re-inserts on active premium), so a user with both web and mobile subs always converges to the highest tier.

### Manual setup checklist

Do these in order before shipping a build that processes real purchases:

1. **Apple — App Store Connect → My Apps → \[your app\] → In-App Purchases**
   - Create an **Auto-Renewable Subscription Group** (e.g. "Murciélingo Premium").
   - Create two products in the group:
     - Monthly — product id `murcielago_premium_monthly_v1` (or whatever you set `EXPO_PUBLIC_RC_PRODUCT_MONTHLY` to).
     - Yearly — product id `murcielago_premium_yearly_v1`.
   - Apple requires localised name + description + a screenshot per product before review.

2. **Google — Play Console → Monetize → Products → Subscriptions**
   - Create the same two products with matching ids. Use a single base plan per product (monthly / yearly auto-renew).
   - Activate both products.

3. **RevenueCat — [app.revenuecat.com](https://app.revenuecat.com)**
   - Create a project (e.g. "Murciélingo").
   - Add an iOS app — paste your App Store Connect shared secret + bundle id (`app.murcielago.mobile`).
   - Add an Android app — upload the Play service account JSON + package name (`app.murcielago.mobile`).
   - **Products**: import the four store products you just created (RC has a "Pull from store" button per app).
   - **Entitlement**: create one entitlement called `premium` and attach all four products to it.
   - **Offering**: create a default offering `default` with two packages — `$rc_monthly` and `$rc_annual` — pointing at the corresponding products. Mark this offering as Current.
   - **API keys**: Project settings → API keys → copy the **public** iOS and Android SDK keys into the `EXPO_PUBLIC_RC_IOS_API_KEY` and `EXPO_PUBLIC_RC_ANDROID_API_KEY` secrets in Replit.

4. **RevenueCat → Supabase/Backend webhook**
   - In RC: Project → Integrations → Webhooks → Add webhook.
   - URL: `https://<your-api-domain>/api/revenuecat/webhook`.
   - Authorization header: any random string. Save the same string as `REVENUECAT_WEBHOOK_AUTH` in Replit Secrets.
   - Send a Test event from the dashboard. The endpoint should return `{ received: true, ok: true }` and a row should appear in `subscription_events` with `provider="revenuecat"`.
   - Spec note: the original Phase 10 brief mentions a Supabase Edge Function. This project uses Express + Drizzle/Postgres instead, so the same architectural goal is implemented as the Express webhook above; entitlements still flow into the shared `user_entitlements` table.

5. **Product id mapping (server)**
   - Set `RC_PRODUCT_MONTHLY` and `RC_PRODUCT_YEARLY` in Replit Secrets to the same ids you used in step 1 + 2. This makes the webhook map RC events → the internal `planId="premium"` deterministically. If you skip this, the webhook falls back to a `/premium|pro/i` regex on the product id, which is fine for the placeholder ids but worth fixing before launch.

6. **Sanity check the flow**
   - Build with `eas build --profile preview`, install on a device, sign in.
   - Open the paywall. The two packages should render with prices from the store.
   - Buy one with a sandbox account. RC fires `INITIAL_PURCHASE` → our webhook → `user_subscriptions` row + `user_entitlements` rows added → next pull-to-refresh on the app sees `isPremium: true`.

### Fallbacks

- No RC keys configured → SDK functions no-op, paywall shows "in-app purchases aren't enabled in this build", `useSubscription` still returns the API view (free access).
- RC unreachable mid-session → `getCurrentOffering()` returns null, paywall shows "no plans available".
- Webhook missing `REVENUECAT_WEBHOOK_AUTH` → endpoint returns 503; existing entitlements aren't touched.

## Running Locally (outside Replit)

```bash
cp .env.example .env
# edit .env with your Clerk key and API URL

# From workspace root
pnpm --filter @workspace/mobile run dev
```
