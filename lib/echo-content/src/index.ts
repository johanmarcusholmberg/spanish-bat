/**
 * @workspace/echo-content
 * -----------------------
 * Tiny shared content library for the Echo learning surface. Both the web
 * app's full 4-step Echo Loop and the mobile app's single-step EchoRecorder
 * pull their phrases from here, so the *content* a learner sees is the same
 * regardless of platform — even when the per-platform UI differs.
 *
 * Phrases are short Spanish sentences derived from the canonical noun
 * catalog used on web (see artifacts/murcielago/src/data/nounsExpanded.ts).
 * They are intentionally simple, level-appropriate, and end with a period
 * so a TTS engine reads them naturally.
 *
 * If you change a phrase here, the web Echo session will continue working
 * because the web's `useEchoLoop` builds its own challenges from the noun
 * catalog directly — this module is only consumed by the *mobile* Echo
 * screen today, but lives in `lib/` so future surfaces can share it.
 */

import type { Level } from "@workspace/practice";

export interface EchoPhrase {
  /** Spanish phrase to echo. */
  es: string;
  /** Swedish translation (for sv learners). */
  sv: string;
  /** English translation (for en learners). */
  en: string;
}

const A1: EchoPhrase[] = [
  { es: "Hola, ¿cómo estás?", sv: "Hej, hur mår du?", en: "Hi, how are you?" },
  { es: "Mucho gusto en conocerte.", sv: "Trevligt att träffas.", en: "Nice to meet you." },
  { es: "La casa es grande.", sv: "Huset är stort.", en: "The house is big." },
  { es: "El perro es amigable.", sv: "Hunden är vänlig.", en: "The dog is friendly." },
  { es: "El gato duerme mucho.", sv: "Katten sover mycket.", en: "The cat sleeps a lot." },
  { es: "El libro es interesante.", sv: "Boken är intressant.", en: "The book is interesting." },
  { es: "El agua está fría.", sv: "Vattnet är kallt.", en: "The water is cold." },
  { es: "Mi familia es grande.", sv: "Min familj är stor.", en: "My family is big." },
  { es: "Mi amigo es divertido.", sv: "Min vän är rolig.", en: "My friend is fun." },
  { es: "Mi madre cocina bien.", sv: "Min mamma lagar god mat.", en: "My mom cooks well." },
];

const A2: EchoPhrase[] = [
  { es: "Me gustaría un café, por favor.", sv: "Jag skulle vilja ha en kaffe, tack.", en: "I'd like a coffee, please." },
  { es: "¿Dónde está la estación?", sv: "Var ligger stationen?", en: "Where is the station?" },
  { es: "Hablo un poco de español.", sv: "Jag pratar lite spanska.", en: "I speak a little Spanish." },
  { es: "Hoy hace mucho calor.", sv: "Idag är det mycket varmt.", en: "It's very hot today." },
  { es: "Necesito comprar pan fresco.", sv: "Jag behöver köpa färskt bröd.", en: "I need to buy fresh bread." },
  { es: "Mi hermana estudia en la universidad.", sv: "Min syster studerar på universitetet.", en: "My sister studies at the university." },
  { es: "Vamos al cine esta noche.", sv: "Vi går på bio i kväll.", en: "We're going to the cinema tonight." },
  { es: "El tren llega a las ocho.", sv: "Tåget kommer klockan åtta.", en: "The train arrives at eight." },
];

const B1: EchoPhrase[] = [
  { es: "¿Podrías repetir eso, por favor?", sv: "Kan du upprepa det, tack?", en: "Could you repeat that, please?" },
  { es: "Aunque llueva, saldremos a caminar.", sv: "Även om det regnar går vi ut och promenerar.", en: "Even if it rains, we'll go for a walk." },
  { es: "Estoy aprendiendo a cocinar comida española.", sv: "Jag lär mig laga spansk mat.", en: "I'm learning to cook Spanish food." },
  { es: "Si tuviera tiempo, viajaría más a menudo.", sv: "Om jag hade tid skulle jag resa oftare.", en: "If I had time, I'd travel more often." },
  { es: "Me parece que esta película es muy interesante.", sv: "Jag tycker att den här filmen är mycket intressant.", en: "I think this movie is very interesting." },
  { es: "Acabo de terminar mi tarea.", sv: "Jag har precis avslutat min läxa.", en: "I just finished my homework." },
];

const B2_PLUS: EchoPhrase[] = [
  { es: "Me hubiera gustado conocer la ciudad antes.", sv: "Jag hade gärna velat lära känna staden tidigare.", en: "I wish I had gotten to know the city sooner." },
  { es: "A pesar de las dificultades, logramos terminar a tiempo.", sv: "Trots svårigheterna lyckades vi avsluta i tid.", en: "Despite the difficulties, we managed to finish on time." },
  { es: "Conviene que practiques cada día, aunque sea poco.", sv: "Det är bra att du övar varje dag, även om det är lite.", en: "It's good that you practice every day, even if just a little." },
  { es: "Si me hubieras avisado, habría llegado más temprano.", sv: "Om du hade berättat hade jag kommit tidigare.", en: "If you had told me, I would have arrived earlier." },
  { es: "Lo que más me sorprendió fue la amabilidad de la gente.", sv: "Det som överraskade mig mest var människornas vänlighet.", en: "What surprised me most was the kindness of the people." },
];

/**
 * Returns up to `count` echo phrases drawn from the user's level and the
 * level just below. Falls back to A1 if the requested level has no entries
 * (defensive — should never happen with the bundled phrases).
 *
 * Phrases are returned in a stable order; callers that want randomness
 * should shuffle on their side, so this stays pure and trivially testable.
 */
export function getEchoPhrases(level: Level, count = 5): EchoPhrase[] {
  const pool: EchoPhrase[] = (() => {
    switch (level) {
      case "A1":
        return A1;
      case "A2":
        return [...A2, ...A1];
      case "B1":
        return [...B1, ...A2];
      case "B2":
      case "C1":
      case "C2":
        return [...B2_PLUS, ...B1];
      default:
        return A1;
    }
  })();
  if (pool.length === 0) return A1.slice(0, count);
  return pool.slice(0, Math.max(1, count));
}
