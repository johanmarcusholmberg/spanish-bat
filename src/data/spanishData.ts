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
  ruleExplanation?: { sv: string; en: string };
}

export interface AdjectiveData {
  masculine: string;
  feminine: string;
  sv: string;
  en: string;
  example: { es: string; sv: string; en: string };
  level: Level;
  ruleExplanation?: { sv: string; en: string };
}

export interface QuizItem {
  question: { sv: string; en: string };
  answer: string;
  accepted_answers?: string[];
  category: string;
  level: Level;
}

export const tenseNames: Record<string, { sv: string; en: string }> = {
  presente: { sv: "Presens", en: "Present" },
  preterito: { sv: "Preteritum", en: "Preterite" },
  imperfecto: { sv: "Imperfekt", en: "Imperfect" },
  perfecto: { sv: "Perfekt", en: "Present Perfect" },
  futuro: { sv: "Futurum", en: "Future" },
  condicional: { sv: "Konditionalis", en: "Conditional" },
  subjuntivo: { sv: "Konjunktiv", en: "Subjunctive" },
  imperativo: { sv: "Imperativ", en: "Imperative" },
  pluscuamperfecto: { sv: "Pluskvamperfekt", en: "Past Perfect" },
  subjuntivo_perfecto: { sv: "Perfekt konjunktiv", en: "Perfect Subjunctive" },
  subjuntivo_imperfecto: { sv: "Imperfekt konjunktiv", en: "Imperfect Subjunctive" },
  ir_a_infinitivo: { sv: "Nära futurum", en: "Near Future" },
};

// Re-export expanded data
import { verbsExpanded } from "./verbsExpanded";
import { nounsExpanded } from "./nounsExpanded";
import { adjectivesExpanded } from "./adjectivesExpanded";

export const verbs: VerbData[] = verbsExpanded;
export const nouns: NounData[] = nounsExpanded;
export const adjectives: AdjectiveData[] = adjectivesExpanded;

export const quizItems: QuizItem[] = [
  // === GREETINGS ===
  // A1
  { question: { sv: "Hej! / God morgon!", en: "Hello! / Good morning!" }, answer: "¡Hola! / ¡Buenos días!", accepted_answers: ["Hola", "Buenos días", "¡Hola!", "¡Buenos días!"], category: "greetings", level: "A1" },
  { question: { sv: "Hur mår du?", en: "How are you?" }, answer: "¿Cómo estás?", accepted_answers: ["¿Qué tal?", "Cómo estás", "Qué tal"], category: "greetings", level: "A1" },
  { question: { sv: "Bra, tack!", en: "Fine, thanks!" }, answer: "¡Bien, gracias!", accepted_answers: ["Bien, gracias", "Bien gracias", "Muy bien, gracias"], category: "greetings", level: "A1" },
  { question: { sv: "Vad heter du?", en: "What's your name?" }, answer: "¿Cómo te llamas?", accepted_answers: ["Cómo te llamas", "¿Cuál es tu nombre?"], category: "greetings", level: "A1" },
  { question: { sv: "Trevligt att träffas!", en: "Nice to meet you!" }, answer: "¡Mucho gusto!", accepted_answers: ["Mucho gusto", "Encantado", "Encantada", "¡Encantado!", "¡Encantada!"], category: "greetings", level: "A1" },
  { question: { sv: "God kväll!", en: "Good evening!" }, answer: "¡Buenas tardes!", accepted_answers: ["Buenas tardes", "¡Buenas noches!", "Buenas noches"], category: "greetings", level: "A1" },
  { question: { sv: "Hej då!", en: "Goodbye!" }, answer: "¡Adiós!", accepted_answers: ["Adiós", "¡Hasta luego!", "Hasta luego", "Chao"], category: "greetings", level: "A1" },
  { question: { sv: "Vi ses!", en: "See you!" }, answer: "¡Nos vemos!", accepted_answers: ["Nos vemos", "¡Hasta luego!", "Hasta pronto"], category: "greetings", level: "A1" },
  // A2
  { question: { sv: "Hur har du det?", en: "How are you doing?" }, answer: "¿Qué tal estás?", accepted_answers: ["¿Cómo te va?", "Qué tal estás", "Cómo te va"], category: "greetings", level: "A2" },
  { question: { sv: "Vi ses imorgon!", en: "See you tomorrow!" }, answer: "¡Hasta mañana!", accepted_answers: ["Hasta mañana", "¡Nos vemos mañana!"], category: "greetings", level: "A2" },
  { question: { sv: "Jag mår bra, och du?", en: "I'm fine, and you?" }, answer: "Estoy bien, ¿y tú?", accepted_answers: ["Estoy bien y tú", "Bien, ¿y tú?", "Bien y tú"], category: "greetings", level: "A2" },
  // B1
  { question: { sv: "Vad roligt att se dig igen!", en: "Great to see you again!" }, answer: "¡Qué alegría verte de nuevo!", accepted_answers: ["Qué alegría verte de nuevo", "¡Me alegro de verte!"], category: "greetings", level: "B1" },
  { question: { sv: "Länge sedan vi sågs!", en: "Long time no see!" }, answer: "¡Cuánto tiempo sin verte!", accepted_answers: ["Cuánto tiempo sin verte", "¡Cuánto tiempo!"], category: "greetings", level: "B1" },

  // === DAILY PHRASES ===
  // A1
  { question: { sv: "Tack så mycket!", en: "Thank you very much!" }, answer: "¡Muchas gracias!", accepted_answers: ["Muchas gracias", "Muchísimas gracias"], category: "dailyPhrases", level: "A1" },
  { question: { sv: "Var snäll / Snälla", en: "Please" }, answer: "Por favor", category: "dailyPhrases", level: "A1" },
  { question: { sv: "Ursäkta mig", en: "Excuse me" }, answer: "Perdón", accepted_answers: ["Disculpe", "Perdona", "Con permiso"], category: "dailyPhrases", level: "A1" },
  { question: { sv: "Jag förstår inte", en: "I don't understand" }, answer: "No entiendo", accepted_answers: ["No comprendo"], category: "dailyPhrases", level: "A1" },
  { question: { sv: "Ja", en: "Yes" }, answer: "Sí", accepted_answers: ["Si"], category: "dailyPhrases", level: "A1" },
  { question: { sv: "Nej", en: "No" }, answer: "No", category: "dailyPhrases", level: "A1" },
  { question: { sv: "Jag vet inte", en: "I don't know" }, answer: "No sé", accepted_answers: ["No lo sé"], category: "dailyPhrases", level: "A1" },
  // A2
  { question: { sv: "Kan du tala långsammare?", en: "Can you speak slower?" }, answer: "¿Puedes hablar más despacio?", accepted_answers: ["Puedes hablar más despacio", "¿Puede hablar más despacio?"], category: "dailyPhrases", level: "A2" },
  { question: { sv: "Vad betyder det?", en: "What does that mean?" }, answer: "¿Qué significa eso?", accepted_answers: ["Qué significa eso", "¿Qué quiere decir eso?"], category: "dailyPhrases", level: "A2" },
  { question: { sv: "Kan du upprepa?", en: "Can you repeat?" }, answer: "¿Puedes repetir?", accepted_answers: ["Puedes repetir", "¿Puede repetir?", "Repite, por favor"], category: "dailyPhrases", level: "A2" },
  { question: { sv: "Jag behöver hjälp", en: "I need help" }, answer: "Necesito ayuda", category: "dailyPhrases", level: "A2" },
  // B1
  { question: { sv: "Jag håller med", en: "I agree" }, answer: "Estoy de acuerdo", accepted_answers: ["De acuerdo", "Tienes razón"], category: "dailyPhrases", level: "B1" },
  { question: { sv: "Det spelar ingen roll", en: "It doesn't matter" }, answer: "No importa", accepted_answers: ["Da igual", "No pasa nada"], category: "dailyPhrases", level: "B1" },
  { question: { sv: "Naturligtvis!", en: "Of course!" }, answer: "¡Por supuesto!", accepted_answers: ["Por supuesto", "¡Claro!", "Claro", "¡Desde luego!"], category: "dailyPhrases", level: "B1" },
  // B2
  { question: { sv: "Det beror på", en: "It depends" }, answer: "Depende", accepted_answers: ["Eso depende"], category: "dailyPhrases", level: "B2" },
  { question: { sv: "Jag menar att...", en: "I mean that..." }, answer: "Quiero decir que...", accepted_answers: ["Me refiero a que..."], category: "dailyPhrases", level: "B2" },

  // === AT THE STORE ===
  // A1
  { question: { sv: "Hur mycket kostar det?", en: "How much does it cost?" }, answer: "¿Cuánto cuesta?", accepted_answers: ["Cuánto cuesta", "¿Cuánto vale?", "Cuánto vale"], category: "atTheStore", level: "A1" },
  { question: { sv: "Jag vill köpa...", en: "I want to buy..." }, answer: "Quiero comprar...", accepted_answers: ["Quiero comprar"], category: "atTheStore", level: "A1" },
  { question: { sv: "Var är affären?", en: "Where is the store?" }, answer: "¿Dónde está la tienda?", accepted_answers: ["Dónde está la tienda"], category: "atTheStore", level: "A1" },
  // A2
  { question: { sv: "Har ni det i en annan storlek?", en: "Do you have it in another size?" }, answer: "¿Lo tiene en otra talla?", accepted_answers: ["Lo tiene en otra talla", "¿Tiene otra talla?"], category: "atTheStore", level: "A2" },
  { question: { sv: "Var kan jag betala?", en: "Where can I pay?" }, answer: "¿Dónde puedo pagar?", accepted_answers: ["Dónde puedo pagar"], category: "atTheStore", level: "A2" },
  { question: { sv: "Kan jag prova den?", en: "Can I try it on?" }, answer: "¿Puedo probármelo?", accepted_answers: ["Puedo probármelo", "¿Me lo puedo probar?"], category: "atTheStore", level: "A2" },
  { question: { sv: "Tar ni kort?", en: "Do you take cards?" }, answer: "¿Aceptan tarjeta?", accepted_answers: ["Aceptan tarjeta", "¿Puedo pagar con tarjeta?"], category: "atTheStore", level: "A2" },
  // B1
  { question: { sv: "Jag vill byta den här", en: "I'd like to exchange this" }, answer: "Quisiera cambiar esto", accepted_answers: ["Quiero cambiar esto", "Me gustaría cambiar esto"], category: "atTheStore", level: "B1" },
  { question: { sv: "Har ni rea?", en: "Do you have sales?" }, answer: "¿Tienen rebajas?", accepted_answers: ["Tienen rebajas", "¿Hay rebajas?"], category: "atTheStore", level: "B1" },

  // === AT THE RESTAURANT ===
  // A1
  { question: { sv: "Kan jag få menyn, tack?", en: "Can I have the menu, please?" }, answer: "¿Me puede dar el menú, por favor?", accepted_answers: ["Me puede dar el menú", "La carta, por favor", "¿Me da la carta?", "El menú, por favor"], category: "atTheRestaurant", level: "A1" },
  { question: { sv: "Notan, tack!", en: "The check, please!" }, answer: "¡La cuenta, por favor!", accepted_answers: ["La cuenta, por favor", "La cuenta por favor"], category: "atTheRestaurant", level: "A1" },
  { question: { sv: "Vatten, tack", en: "Water, please" }, answer: "Agua, por favor", accepted_answers: ["Un agua, por favor"], category: "atTheRestaurant", level: "A1" },
  // A2
  { question: { sv: "Jag vill beställa...", en: "I'd like to order..." }, answer: "Quisiera pedir...", accepted_answers: ["Quisiera pedir", "Quiero pedir", "Me gustaría pedir"], category: "atTheRestaurant", level: "A2" },
  { question: { sv: "Har ni vegetariska alternativ?", en: "Do you have vegetarian options?" }, answer: "¿Tienen opciones vegetarianas?", accepted_answers: ["Tienen opciones vegetarianas", "¿Hay opciones vegetarianas?"], category: "atTheRestaurant", level: "A2" },
  { question: { sv: "Vad rekommenderar du?", en: "What do you recommend?" }, answer: "¿Qué me recomienda?", accepted_answers: ["Qué me recomienda", "¿Qué recomiendas?", "Qué recomiendas"], category: "atTheRestaurant", level: "A2" },
  // B1
  { question: { sv: "Jag är allergisk mot nötter", en: "I'm allergic to nuts" }, answer: "Soy alérgico a los frutos secos", accepted_answers: ["Soy alérgica a los frutos secos", "Tengo alergia a los frutos secos"], category: "atTheRestaurant", level: "B1" },
  { question: { sv: "Kan jag få en till, tack?", en: "Can I have another one, please?" }, answer: "¿Me pone otro, por favor?", accepted_answers: ["Me pone otro por favor", "¿Puedo tener otro?", "Otro más, por favor"], category: "atTheRestaurant", level: "B1" },

  // === VOCABULARY ===
  // A1
  { question: { sv: "familj", en: "family" }, answer: "familia", category: "vocabulary", level: "A1" },
  { question: { sv: "vän", en: "friend" }, answer: "amigo", accepted_answers: ["amiga", "amigo/amiga"], category: "vocabulary", level: "A1" },
  { question: { sv: "tid", en: "time" }, answer: "tiempo", category: "vocabulary", level: "A1" },
  { question: { sv: "hus", en: "house" }, answer: "casa", category: "vocabulary", level: "A1" },
  { question: { sv: "mat", en: "food" }, answer: "comida", category: "vocabulary", level: "A1" },
  { question: { sv: "vatten", en: "water" }, answer: "agua", category: "vocabulary", level: "A1" },
  { question: { sv: "bok", en: "book" }, answer: "libro", category: "vocabulary", level: "A1" },
  { question: { sv: "skola", en: "school" }, answer: "escuela", accepted_answers: ["colegio"], category: "vocabulary", level: "A1" },
  // A2
  { question: { sv: "pengar", en: "money" }, answer: "dinero", category: "vocabulary", level: "A2" },
  { question: { sv: "resa", en: "travel" }, answer: "viaje", category: "vocabulary", level: "A2" },
  { question: { sv: "stad", en: "city" }, answer: "ciudad", category: "vocabulary", level: "A2" },
  { question: { sv: "strand", en: "beach" }, answer: "playa", category: "vocabulary", level: "A2" },
  { question: { sv: "väder", en: "weather" }, answer: "tiempo", accepted_answers: ["clima"], category: "vocabulary", level: "A2" },
  { question: { sv: "arbete", en: "work" }, answer: "trabajo", category: "vocabulary", level: "A2" },
  // B1
  { question: { sv: "möjlighet", en: "opportunity" }, answer: "oportunidad", category: "vocabulary", level: "B1" },
  { question: { sv: "kunskap", en: "knowledge" }, answer: "conocimiento", accepted_answers: ["saber"], category: "vocabulary", level: "B1" },
  { question: { sv: "miljö", en: "environment" }, answer: "medio ambiente", accepted_answers: ["ambiente", "entorno"], category: "vocabulary", level: "B1" },
  { question: { sv: "hälsa", en: "health" }, answer: "salud", category: "vocabulary", level: "B1" },
  // B2
  { question: { sv: "rättvisa", en: "justice" }, answer: "justicia", category: "vocabulary", level: "B2" },
  { question: { sv: "utveckling", en: "development" }, answer: "desarrollo", category: "vocabulary", level: "B2" },
  { question: { sv: "samhälle", en: "society" }, answer: "sociedad", category: "vocabulary", level: "B2" },
  // C1
  { question: { sv: "framsteg", en: "progress" }, answer: "progreso", accepted_answers: ["avance"], category: "vocabulary", level: "C1" },
  { question: { sv: "ojämlikhet", en: "inequality" }, answer: "desigualdad", category: "vocabulary", level: "C1" },
  // C2
  { question: { sv: "förgänglighet", en: "impermanence" }, answer: "fugacidad", accepted_answers: ["transitoriedad"], category: "vocabulary", level: "C2" },
];

export function getItemsForLevel<T extends { level: Level }>(items: T[], userLevel: Level): T[] {
  const levelOrder: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const maxIndex = levelOrder.indexOf(userLevel);
  return items.filter((item) => levelOrder.indexOf(item.level) <= maxIndex);
}
