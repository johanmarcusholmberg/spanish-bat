# Mobile i18n

Lightweight, native-safe translation layer for the Murciélingo mobile app.
The goal is app-wide language state, clean translation keys, and easy room
to add new languages — not an enterprise localization framework.

## Architecture (one-liner per piece)

- `lib/languages.ts` — single source of truth for the `AppLanguage` union,
  the `APP_LANGUAGES` config (flag, label, `enabled`), and the
  `FALLBACK_APP_LANGUAGE` / `resolveAppLanguage` helpers.
- `lib/languagePreference.ts` — the **only** place that touches AsyncStorage
  for the language preference (`get/setPreferredLanguage`).
- `i18n/translations.ts` — the dotted-key translation registry, grouped by
  feature (`common`, `language`, `login`, `register`, `profile`, …).
- `contexts/LanguageContext.tsx` — `<LanguageProvider>` mounted once at the
  root, exposing `{ language, setLanguage, availableLanguages, ready, t }`
  via `useLanguage()` (and the `useT()` shortcut).
- `components/LanguagePicker.tsx` — context-aware picker. Pass nothing and
  it reads/writes the global language. Pass `value`/`onChange` for
  controlled use (e.g. profile picker that also writes to the API).

## Adding a new translation key

1. Open `i18n/translations.ts`.
2. Add the key under the relevant section (or create a new section). Each
   entry must contain a string for **every** `AppLanguage` — TypeScript
   will surface missing locales when you add a new language.

   ```ts
   profile: {
     deleteAccount: { sv: "Radera konto", en: "Delete account" },
   }
   ```

3. Use it in a screen:

   ```tsx
   import { useLanguage } from "@/contexts/LanguageContext";

   const { t } = useLanguage();
   return <Text>{t("profile.deleteAccount")}</Text>;
   ```

   Interpolation uses `{name}` placeholders:
   ```ts
   greeting: { sv: "Hej {name}", en: "Hi {name}" }
   // → t("common.greeting", { name: user.displayName })
   ```

   Missing keys safely fall back to the key string itself; missing locale
   values fall back to `FALLBACK_APP_LANGUAGE`.

## Adding a new app language (e.g. Spanish)

1. In `lib/languages.ts`:
   ```ts
   export type AppLanguage = "sv" | "en" | "es";

   export const APP_LANGUAGES: AppLanguageOption[] = [
     { code: "sv", flag: "🇸🇪", short: "SV", long: "Svenska", enabled: true },
     { code: "en", flag: "🇬🇧", short: "EN", long: "English", enabled: true },
     { code: "es", flag: "🇪🇸", short: "ES", long: "Español", enabled: true },
   ];
   ```
2. Add the matching string to every entry in `i18n/translations.ts`. The
   typed `Record<AppLanguage, string>` shape will fail typecheck until you
   do, which is the intended safety net.
3. That's it. The picker, provider, persistence, validation, and all
   migrated screens pick up the new language with zero further changes.

To temporarily hide a language from pickers without removing it, flip
`enabled: false` — `getEnabledAppLanguages()` filters it out.

## Don't

- ❌ **Don't hardcode language lists in components.** Always read from
  `getEnabledAppLanguages()` (or rely on the picker / context).
- ❌ **Don't read or write AsyncStorage for the language directly from a
  screen or component.** Go through `useLanguage().setLanguage(...)` (or
  `lib/languagePreference.ts` for non-React code paths).
- ❌ **Don't create screen-local language state** (e.g. a `useState` that
  shadows the global language). It causes the flicker we already fixed and
  desyncs from the rest of the app. The only legitimate exception is when
  a screen needs to display a **different** language than the app
  language — in which case make that explicit and document why.
- ❌ **Don't gate hydration of the stored preference on the network or the
  Clerk profile.** The persisted preference is the immediate source of
  truth on mobile; the profile API is synced separately from the profile
  screen.

## First-paint behavior

`<LanguageProvider>` exposes `ready`, which is `false` until the persisted
preference has been read from AsyncStorage. The root layout
(`app/_layout.tsx`) waits for both Clerk auth load **and** `languageReady`
before rendering any screens, so users never see a fallback-language flash
on cold start. Auth screens (`login`, `register`) inherit this guard
automatically because they're mounted under that layout.

## Tests

The mobile workspace doesn't currently have a test runner configured. When
one is added, the highest-value tests for this layer are:

- `LanguageProvider` initializes from a stored preference, falls back when
  the stored value is invalid, and persists changes via `setLanguage`.
- `t()` returns the right string for `sv`/`en`, falls back to the fallback
  language when a locale value is missing, and returns the key for missing
  paths (including malformed dotted keys like `"foo"`, `"a.b.c"`, and
  empty segments).
- `LanguagePicker` only renders `enabled: true` languages and toggles
  through context when used uncontrolled.
