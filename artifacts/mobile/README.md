# Murciélago Mobile App

React Native + Expo mobile app for the Murciélago Spanish learning platform.

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

The mobile app uses **Clerk** (same as the web app) for authentication:

- `@clerk/clerk-expo` handles email/password sign-in.
- After `signIn.create()` succeeds, `setActive({ session: createdSessionId })` establishes the Clerk session.
- The Clerk session JWT is automatically injected as `Authorization: Bearer <token>` into every API request via `setAuthTokenGetter` in `AuthContext`.
- The backend validates the JWT via Clerk middleware — no separate mobile auth endpoint needed.
- Token persistence is handled by Clerk's `tokenCache` backed by `AsyncStorage`.

## Auth Routing

- Unauthenticated users → redirected to `/login` by `RootLayoutNav` + `(tabs)/_layout.tsx`
- Authenticated users on `/login` → redirected to `/(tabs)` automatically

## Styling

The app uses **NativeWind v4** (Tailwind CSS for React Native) alongside `StyleSheet` for fine-grained control. Brand tokens are defined in:

- `tailwind.config.js` — Tailwind color aliases matching the web app palette
- `constants/colors.ts` — JS color tokens for use with `StyleSheet` and the `useColors()` hook

## API Client

`lib/api.ts` is a fetch-based REST client:

- Reads base URL from `process.env.EXPO_PUBLIC_API_BASE_URL` (set to `https://$REPLIT_DEV_DOMAIN/api` in dev)
- Injects `Authorization: Bearer <token>` via the token getter set from `AuthContext`
- Covers profile, streaks, progress, vocabulary, and contact endpoints

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
