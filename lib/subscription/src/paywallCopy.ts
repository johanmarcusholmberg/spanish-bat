/**
 * Centralized, contextual paywall copy.
 *
 * One key per "moment" the spec calls out as a good place to surface
 * Premium. Copy stays warm, learning-benefit focused, with a clear
 * free alternative whenever possible. Localized en/sv to match the
 * rest of the app.
 */

export type PaywallContext =
  | "daily_session_done"
  | "locked_mix"
  | "advanced_insights"
  | "ai_generate"
  | "longer_session"
  | "full_echo"
  | "offline_mode"
  | "custom_notifications"
  | "level_check_limit"
  | "library_locked"
  | "generic";

export interface PaywallCopyEntry {
  title: string;
  body: string;
  /** Primary CTA — usually "Unlock Premium". */
  primaryCta: string;
  /** Secondary CTA the free user can take *right now*. */
  secondaryCta: string;
}

export interface PaywallCopySet {
  en: Record<PaywallContext, PaywallCopyEntry>;
  sv: Record<PaywallContext, PaywallCopyEntry>;
}

export const PAYWALL_COPY: PaywallCopySet = {
  en: {
    daily_session_done: {
      title: "You finished today's free practice",
      body: "Premium unlocks unlimited Today's Practice so you can keep building momentum.",
      primaryCta: "Keep practicing today",
      secondaryCta: "Review basic flashcards",
    },
    locked_mix: {
      title: "Unlock this Practice Mix",
      body: "Premium unlocks every mix — Speaking confidence, Grammar rescue, Stretch me and more.",
      primaryCta: "Unlock Premium",
      secondaryCta: "Do today's free practice",
    },
    advanced_insights: {
      title: "See exactly what to practice next",
      body: "Premium reveals the patterns behind your mistakes and the skills you're closest to mastering.",
      primaryCta: "Unlock insights",
      secondaryCta: "Keep my basic progress",
    },
    ai_generate: {
      title: "Generate more practice from your weak words",
      body: "Premium lets Murci create fresh sentences, dialogues and echo phrases tuned to what you need next.",
      primaryCta: "Unlock AI practice",
      secondaryCta: "Continue with today's set",
    },
    longer_session: {
      title: "Try longer sessions when you have more time",
      body: "Premium lets you choose 2, 5, 10 or 15-minute sessions instead of a single fixed length.",
      primaryCta: "Unlock Premium",
      secondaryCta: "Keep my 5-minute session",
    },
    full_echo: {
      title: "Speak more, with full Echo",
      body: "Premium unlocks longer Echo sessions and pronunciation tracking so speaking gets easier faster.",
      primaryCta: "Unlock full Echo",
      secondaryCta: "Use basic Echo",
    },
    offline_mode: {
      title: "Practice offline",
      body: "Premium caches your reviews so you can practice on the metro, on a flight, or anywhere there's no signal.",
      primaryCta: "Unlock offline review",
      secondaryCta: "Stay online",
    },
    custom_notifications: {
      title: "Pick your own reminder time",
      body: "Premium lets you choose when (and what) Murci reminds you about — daily practice, weak words, weekly summary.",
      primaryCta: "Unlock custom reminders",
      secondaryCta: "Use the default reminder",
    },
    level_check_limit: {
      title: "Take more level checks",
      body: "Premium gives you unlimited level checks plus targeted readiness practice for the next one.",
      primaryCta: "Unlock more checks",
      secondaryCta: "Keep practicing",
    },
    library_locked: {
      title: "Open the full Library",
      body: "Premium unlocks every grammar lesson, vocabulary set and reading passage at your level.",
      primaryCta: "Unlock the Library",
      secondaryCta: "Browse free content",
    },
    generic: {
      title: "Unlock your personal Spanish coach",
      body: "Premium adapts Murcielingo to what you need next — unlimited practice, full insights, all mixes.",
      primaryCta: "Unlock Premium",
      secondaryCta: "Stay on Free",
    },
  },
  sv: {
    daily_session_done: {
      title: "Du klarade dagens gratisövning",
      body: "Premium låser upp obegränsad Dagens övning så du kan hålla farten uppe.",
      primaryCta: "Fortsätt öva idag",
      secondaryCta: "Repetera grundkort",
    },
    locked_mix: {
      title: "Lås upp den här övningsmixen",
      body: "Premium låser upp alla mixar — Tala med självförtroende, Grammatikräddning, Tänj på mig och fler.",
      primaryCta: "Lås upp Premium",
      secondaryCta: "Gör dagens gratisövning",
    },
    advanced_insights: {
      title: "Se exakt vad du ska öva på härnäst",
      body: "Premium visar mönstren bakom dina misstag och vilka färdigheter du är närmast att bemästra.",
      primaryCta: "Lås upp insikter",
      secondaryCta: "Behåll grundläget",
    },
    ai_generate: {
      title: "Generera mer övning från dina svaga ord",
      body: "Premium låter Murci skapa nya meningar, dialoger och echo-fraser anpassade efter vad du behöver härnäst.",
      primaryCta: "Lås upp AI-övning",
      secondaryCta: "Fortsätt med dagens set",
    },
    longer_session: {
      title: "Prova längre pass när du har mer tid",
      body: "Premium låter dig välja 2, 5, 10 eller 15-minuterspass istället för en fast längd.",
      primaryCta: "Lås upp Premium",
      secondaryCta: "Behåll mitt 5-minuterspass",
    },
    full_echo: {
      title: "Tala mer, med full Echo",
      body: "Premium låser upp längre Echo-pass och uttalsspårning så att tala går lättare snabbare.",
      primaryCta: "Lås upp full Echo",
      secondaryCta: "Använd basic Echo",
    },
    offline_mode: {
      title: "Öva offline",
      body: "Premium cachar dina repetitioner så du kan öva på tunnelbanan, på flyget eller var det än saknas täckning.",
      primaryCta: "Lås upp offline-läge",
      secondaryCta: "Stanna online",
    },
    custom_notifications: {
      title: "Välj din egen påminnelsetid",
      body: "Premium låter dig välja när (och vad) Murci påminner dig om — daglig övning, svaga ord, veckorapport.",
      primaryCta: "Lås upp egna påminnelser",
      secondaryCta: "Använd standardpåminnelsen",
    },
    level_check_limit: {
      title: "Gör fler nivåkollar",
      body: "Premium ger obegränsade nivåkollar plus riktad förberedelseövning inför nästa.",
      primaryCta: "Lås upp fler kollar",
      secondaryCta: "Fortsätt öva",
    },
    library_locked: {
      title: "Öppna hela Biblioteket",
      body: "Premium låser upp alla grammatiklektioner, vokabulärset och lästexter på din nivå.",
      primaryCta: "Lås upp Biblioteket",
      secondaryCta: "Bläddra i gratisinnehållet",
    },
    generic: {
      title: "Lås upp din personliga spansklärare",
      body: "Premium anpassar Murcielingo efter vad du behöver härnäst — obegränsad övning, fulla insikter, alla mixar.",
      primaryCta: "Lås upp Premium",
      secondaryCta: "Fortsätt med Free",
    },
  },
};

export function getPaywallCopy(
  context: PaywallContext,
  language: "en" | "sv" = "en",
): PaywallCopyEntry {
  return PAYWALL_COPY[language]?.[context] ?? PAYWALL_COPY.en.generic;
}
