import { Level } from "@/contexts/AuthContext";

export interface VerbData {
  infinitive: string;
  sv: string;
  en: string;
  tenses: {
    [tense: string]: {
      yo: string;
      tú: string;
      él: string;
      nosotros: string;
      vosotros: string;
      ellos: string;
      example: { es: string; sv: string; en: string };
    };
  };
  level: Level;
}

export interface NounData {
  spanish: string;
  sv: string;
  en: string;
  gender: "el" | "la";
  plural: string;
  example: { es: string; sv: string; en: string };
  level: Level;
}

export interface AdjectiveData {
  masculine: string;
  feminine: string;
  sv: string;
  en: string;
  example: { es: string; sv: string; en: string };
  level: Level;
}

export interface QuizItem {
  question: { sv: string; en: string };
  answer: string;
  category: string;
  level: Level;
}

export const tenseNames: Record<string, { sv: string; en: string }> = {
  presente: { sv: "Presens", en: "Present" },
  preterito: { sv: "Preteritum", en: "Preterite" },
  imperfecto: { sv: "Imperfekt", en: "Imperfect" },
  perfecto: { sv: "Perfekt", en: "Perfect" },
  futuro: { sv: "Futurum", en: "Future" },
  condicional: { sv: "Konditionalis", en: "Conditional" },
  subjuntivo: { sv: "Konjunktiv", en: "Subjunctive" },
};

// Re-export expanded data
import { verbsExpanded } from "./verbsExpanded";
import { nounsExpanded } from "./nounsExpanded";
import { adjectivesExpanded } from "./adjectivesExpanded";

export const verbs: VerbData[] = verbsExpanded;
export const nouns: NounData[] = nounsExpanded;
export const adjectives: AdjectiveData[] = adjectivesExpanded;

export const quizItems: QuizItem[] = [
  // Greetings
  { question: { sv: "Hej! / God morgon!", en: "Hello! / Good morning!" }, answer: "¡Hola! / ¡Buenos días!", category: "greetings", level: "A1" },
  { question: { sv: "Hur mår du?", en: "How are you?" }, answer: "¿Cómo estás?", category: "greetings", level: "A1" },
  { question: { sv: "Bra, tack!", en: "Fine, thanks!" }, answer: "¡Bien, gracias!", category: "greetings", level: "A1" },
  { question: { sv: "Vad heter du?", en: "What's your name?" }, answer: "¿Cómo te llamas?", category: "greetings", level: "A1" },
  { question: { sv: "Trevligt att träffas!", en: "Nice to meet you!" }, answer: "¡Mucho gusto!", category: "greetings", level: "A1" },

  // Daily phrases
  { question: { sv: "Tack så mycket!", en: "Thank you very much!" }, answer: "¡Muchas gracias!", category: "dailyPhrases", level: "A1" },
  { question: { sv: "Var snäll / Snälla", en: "Please" }, answer: "Por favor", category: "dailyPhrases", level: "A1" },
  { question: { sv: "Ursäkta mig", en: "Excuse me" }, answer: "Perdón / Disculpe", category: "dailyPhrases", level: "A1" },
  { question: { sv: "Jag förstår inte", en: "I don't understand" }, answer: "No entiendo", category: "dailyPhrases", level: "A1" },
  { question: { sv: "Kan du tala långsammare?", en: "Can you speak slower?" }, answer: "¿Puedes hablar más despacio?", category: "dailyPhrases", level: "A2" },

  // At the store
  { question: { sv: "Hur mycket kostar det?", en: "How much does it cost?" }, answer: "¿Cuánto cuesta?", category: "atTheStore", level: "A1" },
  { question: { sv: "Jag vill köpa...", en: "I want to buy..." }, answer: "Quiero comprar...", category: "atTheStore", level: "A1" },
  { question: { sv: "Har ni det i en annan storlek?", en: "Do you have it in another size?" }, answer: "¿Lo tiene en otra talla?", category: "atTheStore", level: "A2" },
  { question: { sv: "Var kan jag betala?", en: "Where can I pay?" }, answer: "¿Dónde puedo pagar?", category: "atTheStore", level: "A2" },

  // At the restaurant
  { question: { sv: "Kan jag få menyn, tack?", en: "Can I have the menu, please?" }, answer: "¿Me puede dar el menú, por favor?", category: "atTheRestaurant", level: "A1" },
  { question: { sv: "Jag vill beställa...", en: "I'd like to order..." }, answer: "Quisiera pedir...", category: "atTheRestaurant", level: "A2" },
  { question: { sv: "Notan, tack!", en: "The check, please!" }, answer: "¡La cuenta, por favor!", category: "atTheRestaurant", level: "A1" },
  { question: { sv: "Har ni vegetariska alternativ?", en: "Do you have vegetarian options?" }, answer: "¿Tienen opciones vegetarianas?", category: "atTheRestaurant", level: "A2" },

  // Vocabulary
  { question: { sv: "familj", en: "family" }, answer: "familia", category: "vocabulary", level: "A1" },
  { question: { sv: "vän", en: "friend" }, answer: "amigo/amiga", category: "vocabulary", level: "A1" },
  { question: { sv: "tid", en: "time" }, answer: "tiempo", category: "vocabulary", level: "A1" },
  { question: { sv: "pengar", en: "money" }, answer: "dinero", category: "vocabulary", level: "A2" },
  { question: { sv: "resa", en: "travel" }, answer: "viaje", category: "vocabulary", level: "A2" },
];

export function getItemsForLevel<T extends { level: Level }>(items: T[], userLevel: Level): T[] {
  const levelOrder: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const maxIndex = levelOrder.indexOf(userLevel);
  return items.filter((item) => levelOrder.indexOf(item.level) <= maxIndex);
}
