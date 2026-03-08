import { Level } from "@/contexts/AuthContext";

export interface Flashcard {
  id: string;
  front: { sv: string; en: string };
  back: string;
  category: string;
  level: Level;
}

export const flashcardData: Flashcard[] = [
  // A1 - Basic vocabulary
  { id: "fc-1", front: { sv: "hund", en: "dog" }, back: "el perro", category: "animals", level: "A1" },
  { id: "fc-2", front: { sv: "katt", en: "cat" }, back: "el gato", category: "animals", level: "A1" },
  { id: "fc-3", front: { sv: "hus", en: "house" }, back: "la casa", category: "home", level: "A1" },
  { id: "fc-4", front: { sv: "vatten", en: "water" }, back: "el agua", category: "food", level: "A1" },
  { id: "fc-5", front: { sv: "bröd", en: "bread" }, back: "el pan", category: "food", level: "A1" },
  { id: "fc-6", front: { sv: "mjölk", en: "milk" }, back: "la leche", category: "food", level: "A1" },
  { id: "fc-7", front: { sv: "bok", en: "book" }, back: "el libro", category: "objects", level: "A1" },
  { id: "fc-8", front: { sv: "skola", en: "school" }, back: "la escuela", category: "places", level: "A1" },
  { id: "fc-9", front: { sv: "vän", en: "friend" }, back: "el amigo / la amiga", category: "people", level: "A1" },
  { id: "fc-10", front: { sv: "mamma", en: "mother" }, back: "la madre", category: "family", level: "A1" },
  { id: "fc-11", front: { sv: "pappa", en: "father" }, back: "el padre", category: "family", level: "A1" },
  { id: "fc-12", front: { sv: "bror", en: "brother" }, back: "el hermano", category: "family", level: "A1" },
  { id: "fc-13", front: { sv: "syster", en: "sister" }, back: "la hermana", category: "family", level: "A1" },
  { id: "fc-14", front: { sv: "röd", en: "red" }, back: "rojo/roja", category: "colors", level: "A1" },
  { id: "fc-15", front: { sv: "blå", en: "blue" }, back: "azul", category: "colors", level: "A1" },
  { id: "fc-16", front: { sv: "grön", en: "green" }, back: "verde", category: "colors", level: "A1" },
  { id: "fc-17", front: { sv: "stor", en: "big" }, back: "grande", category: "adjectives", level: "A1" },
  { id: "fc-18", front: { sv: "liten", en: "small" }, back: "pequeño/pequeña", category: "adjectives", level: "A1" },
  { id: "fc-19", front: { sv: "bra", en: "good" }, back: "bueno/buena", category: "adjectives", level: "A1" },
  { id: "fc-20", front: { sv: "dålig", en: "bad" }, back: "malo/mala", category: "adjectives", level: "A1" },
  { id: "fc-21", front: { sv: "äta", en: "to eat" }, back: "comer", category: "verbs", level: "A1" },
  { id: "fc-22", front: { sv: "dricka", en: "to drink" }, back: "beber", category: "verbs", level: "A1" },
  { id: "fc-23", front: { sv: "tala", en: "to speak" }, back: "hablar", category: "verbs", level: "A1" },
  { id: "fc-24", front: { sv: "gå", en: "to go" }, back: "ir", category: "verbs", level: "A1" },
  { id: "fc-25", front: { sv: "dag", en: "day" }, back: "el día", category: "time", level: "A1" },

  // A2
  { id: "fc-26", front: { sv: "flygplats", en: "airport" }, back: "el aeropuerto", category: "travel", level: "A2" },
  { id: "fc-27", front: { sv: "strand", en: "beach" }, back: "la playa", category: "travel", level: "A2" },
  { id: "fc-28", front: { sv: "restaurang", en: "restaurant" }, back: "el restaurante", category: "food", level: "A2" },
  { id: "fc-29", front: { sv: "räkning/nota", en: "bill/check" }, back: "la cuenta", category: "food", level: "A2" },
  { id: "fc-30", front: { sv: "granne", en: "neighbor" }, back: "el vecino / la vecina", category: "people", level: "A2" },
  { id: "fc-31", front: { sv: "sjukhus", en: "hospital" }, back: "el hospital", category: "places", level: "A2" },
  { id: "fc-32", front: { sv: "apotek", en: "pharmacy" }, back: "la farmacia", category: "places", level: "A2" },
  { id: "fc-33", front: { sv: "resa", en: "trip" }, back: "el viaje", category: "travel", level: "A2" },
  { id: "fc-34", front: { sv: "väder", en: "weather" }, back: "el tiempo / el clima", category: "nature", level: "A2" },
  { id: "fc-35", front: { sv: "födelsedag", en: "birthday" }, back: "el cumpleaños", category: "celebrations", level: "A2" },
  { id: "fc-36", front: { sv: "köpa", en: "to buy" }, back: "comprar", category: "verbs", level: "A2" },
  { id: "fc-37", front: { sv: "sälja", en: "to sell" }, back: "vender", category: "verbs", level: "A2" },
  { id: "fc-38", front: { sv: "förklara", en: "to explain" }, back: "explicar", category: "verbs", level: "A2" },
  { id: "fc-39", front: { sv: "förstå", en: "to understand" }, back: "entender / comprender", category: "verbs", level: "A2" },
  { id: "fc-40", front: { sv: "ibland", en: "sometimes" }, back: "a veces", category: "adverbs", level: "A2" },

  // B1
  { id: "fc-41", front: { sv: "miljö", en: "environment" }, back: "el medio ambiente", category: "society", level: "B1" },
  { id: "fc-42", front: { sv: "utveckling", en: "development" }, back: "el desarrollo", category: "society", level: "B1" },
  { id: "fc-43", front: { sv: "erfarenhet", en: "experience" }, back: "la experiencia", category: "abstract", level: "B1" },
  { id: "fc-44", front: { sv: "förslag", en: "suggestion" }, back: "la sugerencia / la propuesta", category: "abstract", level: "B1" },
  { id: "fc-45", front: { sv: "framgång", en: "success" }, back: "el éxito", category: "abstract", level: "B1" },
  { id: "fc-46", front: { sv: "uppnå", en: "to achieve" }, back: "lograr / conseguir", category: "verbs", level: "B1" },
  { id: "fc-47", front: { sv: "kräva", en: "to require" }, back: "exigir / requerir", category: "verbs", level: "B1" },
  { id: "fc-48", front: { sv: "trots", en: "despite" }, back: "a pesar de", category: "connectors", level: "B1" },
  { id: "fc-49", front: { sv: "dessutom", en: "moreover" }, back: "además", category: "connectors", level: "B1" },
  { id: "fc-50", front: { sv: "dock / emellertid", en: "however" }, back: "sin embargo", category: "connectors", level: "B1" },

  // B2
  { id: "fc-51", front: { sv: "påverka", en: "to influence" }, back: "influir", category: "verbs", level: "B2" },
  { id: "fc-52", front: { sv: "ojämlikhet", en: "inequality" }, back: "la desigualdad", category: "society", level: "B2" },
  { id: "fc-53", front: { sv: "medborgare", en: "citizen" }, back: "el/la ciudadano/a", category: "society", level: "B2" },
  { id: "fc-54", front: { sv: "ta itu med", en: "to address (a problem)" }, back: "abordar", category: "verbs", level: "B2" },
  { id: "fc-55", front: { sv: "sträva efter", en: "to strive for" }, back: "aspirar a / luchar por", category: "verbs", level: "B2" },
  { id: "fc-56", front: { sv: "i sin tur", en: "in turn" }, back: "a su vez", category: "connectors", level: "B2" },
  { id: "fc-57", front: { sv: "å andra sidan", en: "on the other hand" }, back: "por otro lado", category: "connectors", level: "B2" },
  { id: "fc-58", front: { sv: "förutsättning", en: "prerequisite" }, back: "el requisito / la condición previa", category: "abstract", level: "B2" },

  // C1
  { id: "fc-59", front: { sv: "ifrågasätta", en: "to question/challenge" }, back: "cuestionar", category: "verbs", level: "C1" },
  { id: "fc-60", front: { sv: "avskräcka", en: "to deter" }, back: "disuadir", category: "verbs", level: "C1" },
  { id: "fc-61", front: { sv: "förankra", en: "to anchor/embed" }, back: "arraigar", category: "verbs", level: "C1" },
  { id: "fc-62", front: { sv: "samförstånd", en: "consensus" }, back: "el consenso", category: "abstract", level: "C1" },
  { id: "fc-63", front: { sv: "motståndskraft", en: "resilience" }, back: "la resiliencia", category: "abstract", level: "C1" },
  { id: "fc-64", front: { sv: "inte desto mindre", en: "nevertheless" }, back: "no obstante", category: "connectors", level: "C1" },
  { id: "fc-65", front: { sv: "till följd av", en: "as a result of" }, back: "a raíz de", category: "connectors", level: "C1" },
];
