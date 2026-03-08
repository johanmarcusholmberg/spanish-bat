import { Level } from "@/contexts/AuthContext";

export interface SentenceExercise {
  id: string;
  correctOrder: string[];
  translation: { sv: string; en: string };
  level: Level;
  category: string;
}

export const sentenceExercises: SentenceExercise[] = [
  // A1 - Basic sentences
  { id: "sb-a1-1", correctOrder: ["Yo", "me", "llamo", "María"], translation: { sv: "Jag heter María", en: "My name is María" }, level: "A1", category: "greetings" },
  { id: "sb-a1-2", correctOrder: ["Ella", "tiene", "un", "gato"], translation: { sv: "Hon har en katt", en: "She has a cat" }, level: "A1", category: "basics" },
  { id: "sb-a1-3", correctOrder: ["Nosotros", "vivimos", "en", "Madrid"], translation: { sv: "Vi bor i Madrid", en: "We live in Madrid" }, level: "A1", category: "basics" },
  { id: "sb-a1-4", correctOrder: ["El", "libro", "es", "interesante"], translation: { sv: "Boken är intressant", en: "The book is interesting" }, level: "A1", category: "basics" },
  { id: "sb-a1-5", correctOrder: ["Tú", "hablas", "español", "bien"], translation: { sv: "Du talar spanska bra", en: "You speak Spanish well" }, level: "A1", category: "basics" },
  { id: "sb-a1-6", correctOrder: ["La", "casa", "es", "grande"], translation: { sv: "Huset är stort", en: "The house is big" }, level: "A1", category: "basics" },
  { id: "sb-a1-7", correctOrder: ["Yo", "como", "una", "manzana"], translation: { sv: "Jag äter ett äpple", en: "I eat an apple" }, level: "A1", category: "food" },
  { id: "sb-a1-8", correctOrder: ["Ellos", "son", "mis", "amigos"], translation: { sv: "De är mina vänner", en: "They are my friends" }, level: "A1", category: "basics" },
  { id: "sb-a1-9", correctOrder: ["El", "perro", "está", "aquí"], translation: { sv: "Hunden är här", en: "The dog is here" }, level: "A1", category: "basics" },
  { id: "sb-a1-10", correctOrder: ["Yo", "quiero", "agua", "fría"], translation: { sv: "Jag vill ha kallt vatten", en: "I want cold water" }, level: "A1", category: "food" },

  // A2
  { id: "sb-a2-1", correctOrder: ["Me", "levanto", "a", "las", "siete"], translation: { sv: "Jag går upp klockan sju", en: "I get up at seven" }, level: "A2", category: "daily" },
  { id: "sb-a2-2", correctOrder: ["Ayer", "fui", "al", "cine", "con", "mis", "amigos"], translation: { sv: "Igår gick jag på bio med mina vänner", en: "Yesterday I went to the cinema with my friends" }, level: "A2", category: "past" },
  { id: "sb-a2-3", correctOrder: ["El", "restaurante", "está", "cerca", "del", "hotel"], translation: { sv: "Restaurangen är nära hotellet", en: "The restaurant is near the hotel" }, level: "A2", category: "directions" },
  { id: "sb-a2-4", correctOrder: ["Me", "gusta", "mucho", "la", "música", "española"], translation: { sv: "Jag gillar spansk musik mycket", en: "I really like Spanish music" }, level: "A2", category: "likes" },
  { id: "sb-a2-5", correctOrder: ["Ella", "compró", "un", "vestido", "rojo", "ayer"], translation: { sv: "Hon köpte en röd klänning igår", en: "She bought a red dress yesterday" }, level: "A2", category: "past" },
  { id: "sb-a2-6", correctOrder: ["Necesito", "ir", "al", "supermercado", "esta", "tarde"], translation: { sv: "Jag behöver gå till snabbköpet i eftermiddag", en: "I need to go to the supermarket this afternoon" }, level: "A2", category: "daily" },
  { id: "sb-a2-7", correctOrder: ["El", "tren", "sale", "a", "las", "diez"], translation: { sv: "Tåget avgår klockan tio", en: "The train leaves at ten" }, level: "A2", category: "travel" },
  { id: "sb-a2-8", correctOrder: ["Mi", "hermana", "estudia", "medicina", "en", "la", "universidad"], translation: { sv: "Min syster studerar medicin på universitetet", en: "My sister studies medicine at the university" }, level: "A2", category: "studies" },

  // B1
  { id: "sb-b1-1", correctOrder: ["Cuando", "era", "niño", "jugaba", "en", "el", "parque"], translation: { sv: "När jag var liten lekte jag i parken", en: "When I was a child, I played in the park" }, level: "B1", category: "past" },
  { id: "sb-b1-2", correctOrder: ["Espero", "que", "vengas", "a", "mi", "fiesta"], translation: { sv: "Jag hoppas att du kommer på min fest", en: "I hope you come to my party" }, level: "B1", category: "subjunctive" },
  { id: "sb-b1-3", correctOrder: ["Si", "tengo", "tiempo", "iré", "al", "gimnasio"], translation: { sv: "Om jag har tid, går jag till gymmet", en: "If I have time, I'll go to the gym" }, level: "B1", category: "conditional" },
  { id: "sb-b1-4", correctOrder: ["Me", "encantaría", "viajar", "por", "toda", "América", "Latina"], translation: { sv: "Jag skulle älska att resa genom hela Latinamerika", en: "I'd love to travel through all of Latin America" }, level: "B1", category: "conditional" },
  { id: "sb-b1-5", correctOrder: ["Antes", "de", "que", "llueva", "debemos", "salir"], translation: { sv: "Innan det regnar bör vi gå", en: "Before it rains we should leave" }, level: "B1", category: "subjunctive" },
  { id: "sb-b1-6", correctOrder: ["He", "estado", "aprendiendo", "español", "durante", "dos", "años"], translation: { sv: "Jag har lärt mig spanska i två år", en: "I have been learning Spanish for two years" }, level: "B1", category: "perfect" },

  // B2
  { id: "sb-b2-1", correctOrder: ["Si", "hubiera", "estudiado", "más", "habría", "aprobado", "el", "examen"], translation: { sv: "Om jag hade pluggat mer, hade jag klarat provet", en: "If I had studied more, I would have passed the exam" }, level: "B2", category: "conditional" },
  { id: "sb-b2-2", correctOrder: ["Aunque", "no", "me", "guste", "tengo", "que", "hacerlo"], translation: { sv: "Även om jag inte gillar det, måste jag göra det", en: "Even though I don't like it, I have to do it" }, level: "B2", category: "subjunctive" },
  { id: "sb-b2-3", correctOrder: ["Es", "importante", "que", "todos", "cuidemos", "el", "medio", "ambiente"], translation: { sv: "Det är viktigt att vi alla tar hand om miljön", en: "It's important that we all take care of the environment" }, level: "B2", category: "subjunctive" },
  { id: "sb-b2-4", correctOrder: ["No", "creo", "que", "sea", "posible", "terminar", "a", "tiempo"], translation: { sv: "Jag tror inte att det är möjligt att bli klar i tid", en: "I don't think it's possible to finish on time" }, level: "B2", category: "subjunctive" },

  // C1
  { id: "sb-c1-1", correctOrder: ["De", "haber", "sabido", "la", "verdad", "habría", "actuado", "de", "otra", "manera"], translation: { sv: "Hade jag vetat sanningen, hade jag agerat annorlunda", en: "Had I known the truth, I would have acted differently" }, level: "C1", category: "conditional" },
  { id: "sb-c1-2", correctOrder: ["Por", "mucho", "que", "se", "esfuerce", "no", "conseguirá", "convencerme"], translation: { sv: "Hur mycket han än anstränger sig, kommer han inte lyckas övertyga mig", en: "No matter how hard he tries, he won't manage to convince me" }, level: "C1", category: "subjunctive" },
];
