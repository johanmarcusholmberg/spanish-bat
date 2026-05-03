import type { AppLanguage } from "@/lib/languages";

/**
 * Mobile translation registry.
 *
 * Each key maps to an object keyed by app language code (sv/en, more later).
 * Keep keys grouped by feature/section. Add new languages by extending the
 * `AppLanguage` union in `lib/languages.ts` and adding the matching string to
 * each entry below — no UI component changes needed.
 *
 * Migration TODO: most mobile screens still use hardcoded strings. Migrate
 * incrementally, one screen/section at a time, by adding entries here and
 * swapping the literal in the screen for `t("...")`.
 */
export type TranslationEntry = Record<AppLanguage, string>;

export const translations = {
  // Generic
  common: {
    save: { sv: "Spara", en: "Save" },
    cancel: { sv: "Avbryt", en: "Cancel" },
    loading: { sv: "Laddar…", en: "Loading…" },
    error: { sv: "Något gick fel", en: "Something went wrong" },
    retry: { sv: "Försök igen", en: "Try again" },
    signOut: { sv: "Logga ut", en: "Sign out" },
  },

  // Language picker UI
  language: {
    title: { sv: "Språk", en: "Language" },
    change: { sv: "Byt språk", en: "Change language" },
    appLanguage: { sv: "Appspråk", en: "App language" },
    learningFrom: { sv: "Jag lär mig från", en: "Learning from" },
  },

  // Login screen
  login: {
    title: { sv: "Logga in", en: "Sign in" },
    tagline: { sv: "Lär dig spanska naturligt", en: "Learn Spanish naturally" },
    subtitlePassword: {
      sv: "Använd din e-post och ditt lösenord.",
      en: "Use your email and password.",
    },
    subtitleCode: {
      sv: "Vi mailar dig en engångskod — inget lösenord behövs.",
      en: "We'll email you a one-time code — no password needed.",
    },
    submit: { sv: "Logga in", en: "Sign in" },
    submitting: { sv: "Loggar in…", en: "Signing in…" },
    sendCode: { sv: "Skicka kod", en: "Send code" },
    sendingCode: { sv: "Skickar…", en: "Sending…" },
    forgotPassword: { sv: "Glömt lösenord?", en: "Forgot password?" },
    useCodeInstead: { sv: "Logga in med kod istället", en: "Sign in with a code instead" },
    usePasswordInstead: { sv: "Använd lösenord istället", en: "Use your password instead" },
    orSignInWith: { sv: "eller logga in med", en: "or sign in with" },
    continueWithGoogle: { sv: "Fortsätt med Google", en: "Continue with Google" },
    continueWithApple: { sv: "Fortsätt med Apple", en: "Continue with Apple" },
    noAccount: { sv: "Har du inget konto?", en: "Don't have an account?" },
    createOne: { sv: "Skapa ett", en: "Create one" },
  },

  // Register screen
  register: {
    title: { sv: "Skapa ditt konto", en: "Create your account" },
    subtitle: {
      sv: "Vi mailar dig en kod för att bekräfta.",
      en: "We'll email you a code to confirm.",
    },
    backToSignIn: { sv: "Tillbaka till inloggning", en: "Back to sign in" },
    sendCode: { sv: "Skicka kod", en: "Send code" },
    sendingCode: { sv: "Skickar…", en: "Sending…" },
    orSignUpWith: { sv: "eller registrera dig med", en: "or sign up with" },
    continueWithGoogle: { sv: "Fortsätt med Google", en: "Continue with Google" },
    continueWithApple: { sv: "Fortsätt med Apple", en: "Continue with Apple" },
    haveAccount: { sv: "Har du redan ett konto?", en: "Already have an account?" },
    signIn: { sv: "Logga in", en: "Sign in" },
  },

  // First-session welcome / onboarding
  welcome: {
    title: { sv: "Välkommen till Murcielingo", en: "Welcome to Murcielingo" },
    tagline: {
      sv: "Eka språket, en liten övning i taget.",
      en: "Echo the language, one small session at a time.",
    },
    methodEyebrow: { sv: "ECHO-METODEN", en: "THE ECHO METHOD" },
    methodBody: {
      sv: "Du ser det, hör det, ekar det, bygger med det och använder det. Vi hjälper dig öva orden och fraserna som nästan sitter.",
      en: "You see it, hear it, echo it, build with it, and use it. We'll help you practice the words and phrases that are almost there.",
    },
    shortSessionsLabel: { sv: "Korta dagliga sessioner", en: "Short daily sessions" },
    shortSessionsBody: { sv: "Börja med 3 minuter idag.", en: "Start with 3 minutes today." },
    guideLabel: { sv: "Vi vägleder dig", en: "We'll guide you" },
    guideBody: {
      sv: "Du behöver inte välja en modul — Murcielingo vet vad du behöver eka härnäst.",
      en: "No need to choose a module — Murcielingo knows what to echo next.",
    },
    startCta: {
      sv: "Starta din första 3-minutersövning",
      en: "Start your first 3-minute practice",
    },
    skipCta: { sv: "Hoppa över för nu", en: "Skip for now" },
    todaysPractice: { sv: "Dagens övning", en: "Today's practice" },
  },

  // Profile / settings
  profile: {
    learningFrom: { sv: "Jag lär mig från", en: "Learning from" },
    signOut: { sv: "Logga ut", en: "Sign out" },
    signOutConfirmTitle: { sv: "Logga ut", en: "Sign out" },
    signOutConfirmBody: {
      sv: "Är du säker på att du vill logga ut?",
      en: "Are you sure you want to sign out?",
    },
  },
} as const;

export type TranslationDict = typeof translations;
