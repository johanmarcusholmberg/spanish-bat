/**
 * Central curriculum configuration — source of truth for CEFR level/topic/difficulty mapping.
 */
import type { Level } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  TOPIC                                                              */
/* ------------------------------------------------------------------ */

export interface CurriculumTopic {
  id: string;
  label: { sv: string; en: string };
  level: Level;
  difficulty: 1 | 2 | 3; // within level
  grammarTags: string[];
  vocabularyTags: string[];
  exerciseModes: ExerciseMode[];
  freestyle: boolean;
  review: boolean;
  challenge: boolean;
  /** Sample vocabulary / phrases for freestyle generation */
  sampleContent?: FreestyleItem[];
}

export type ExerciseMode =
  | "flashcards"
  | "multiple-choice"
  | "typing"
  | "matching"
  | "pronunciation"
  | "sentence-completion"
  | "mixed-quiz";

export interface FreestyleItem {
  es: string;
  sv: string;
  en: string;
}

/* ------------------------------------------------------------------ */
/*  LEVEL META                                                         */
/* ------------------------------------------------------------------ */

export interface LevelMeta {
  level: Level;
  label: { sv: string; en: string };
  description: { sv: string; en: string };
  topics: string[]; // topic ids
}

export const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LEVELS: LevelMeta[] = [
  {
    level: "A1",
    label: { sv: "A1 – Nybörjare", en: "A1 – Beginner" },
    description: { sv: "Grundläggande ord, hälsningar och enkla meningar", en: "Basic words, greetings and simple sentences" },
    topics: [
      "greetings", "introductions", "numbers", "colors", "weekdays", "months",
      "time-basics", "family", "common-food", "simple-directions",
      "basic-verbs", "question-words", "classroom", "body-parts",
    ],
  },
  {
    level: "A2",
    label: { sv: "A2 – Elementär", en: "A2 – Elementary" },
    description: { sv: "Vardagssituationer, shopping, resor och enkla samtal", en: "Everyday situations, shopping, travel and simple conversations" },
    topics: [
      "shopping", "restaurant", "daily-routines", "travel-basics",
      "weather", "hobbies", "health", "housing", "professions",
      "past-tense-basics", "future-basics",
    ],
  },
  {
    level: "B1",
    label: { sv: "B1 – Mellannivå", en: "B1 – Intermediate" },
    description: { sv: "Åsikter, berättelser och mer komplexa samtal", en: "Opinions, narratives and more complex conversations" },
    topics: [
      "opinions", "narration", "comparison", "environment",
      "media", "education", "subjunctive-intro", "conditional",
    ],
  },
  {
    level: "B2",
    label: { sv: "B2 – Övre mellannivå", en: "B2 – Upper Intermediate" },
    description: { sv: "Abstrakt diskussion, idiom och nyanserat språk", en: "Abstract discussion, idioms and nuanced language" },
    topics: [
      "abstract-ideas", "idioms", "debate", "culture",
      "advanced-subjunctive", "formal-writing",
    ],
  },
  {
    level: "C1",
    label: { sv: "C1 – Avancerad", en: "C1 – Advanced" },
    description: { sv: "Flytande användning med nyanser och akademiskt språk", en: "Fluent usage with nuances and academic language" },
    topics: [
      "academic-language", "literary-analysis", "professional-spanish",
      "regional-varieties",
    ],
  },
  {
    level: "C2",
    label: { sv: "C2 – Mästare", en: "C2 – Mastery" },
    description: { sv: "Nära modersmålsnivå, idiomatisk och stilistisk behärskning", en: "Near-native, idiomatic and stylistic mastery" },
    topics: ["mastery-review"],
  },
];

/* ------------------------------------------------------------------ */
/*  TOPICS REGISTRY                                                    */
/* ------------------------------------------------------------------ */

export const TOPICS: CurriculumTopic[] = [
  // ═══════════════ A1 ═══════════════
  {
    id: "greetings",
    label: { sv: "Hälsningar", en: "Greetings" },
    level: "A1", difficulty: 1,
    grammarTags: [], vocabularyTags: ["greetings"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Hola", sv: "Hej", en: "Hello" },
      { es: "Buenos días", sv: "God morgon", en: "Good morning" },
      { es: "Buenas tardes", sv: "God eftermiddag", en: "Good afternoon" },
      { es: "Buenas noches", sv: "God natt", en: "Good night" },
      { es: "¿Cómo estás?", sv: "Hur mår du?", en: "How are you?" },
      { es: "Bien, gracias", sv: "Bra, tack", en: "Fine, thank you" },
      { es: "Adiós", sv: "Hejdå", en: "Goodbye" },
      { es: "Hasta luego", sv: "Vi ses", en: "See you later" },
      { es: "Por favor", sv: "Snälla / Tack", en: "Please" },
      { es: "Gracias", sv: "Tack", en: "Thank you" },
      { es: "De nada", sv: "Varsågod", en: "You're welcome" },
      { es: "Lo siento", sv: "Förlåt", en: "I'm sorry" },
    ],
  },
  {
    id: "introductions",
    label: { sv: "Presentationer", en: "Introductions" },
    level: "A1", difficulty: 1,
    grammarTags: ["ser", "llamarse"], vocabularyTags: ["introductions"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Me llamo…", sv: "Jag heter…", en: "My name is…" },
      { es: "¿Cómo te llamas?", sv: "Vad heter du?", en: "What's your name?" },
      { es: "Soy de…", sv: "Jag är från…", en: "I'm from…" },
      { es: "Tengo … años", sv: "Jag är … år", en: "I'm … years old" },
      { es: "Mucho gusto", sv: "Trevligt att träffas", en: "Nice to meet you" },
      { es: "¿De dónde eres?", sv: "Varifrån kommer du?", en: "Where are you from?" },
      { es: "Encantado/a", sv: "Trevligt", en: "Pleased to meet you" },
      { es: "Vivo en…", sv: "Jag bor i…", en: "I live in…" },
    ],
  },
  {
    id: "numbers",
    label: { sv: "Siffror", en: "Numbers" },
    level: "A1", difficulty: 1,
    grammarTags: [], vocabularyTags: ["numbers"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "uno", sv: "ett", en: "one" },
      { es: "dos", sv: "två", en: "two" },
      { es: "tres", sv: "tre", en: "three" },
      { es: "cuatro", sv: "fyra", en: "four" },
      { es: "cinco", sv: "fem", en: "five" },
      { es: "seis", sv: "sex", en: "six" },
      { es: "siete", sv: "sju", en: "seven" },
      { es: "ocho", sv: "åtta", en: "eight" },
      { es: "nueve", sv: "nio", en: "nine" },
      { es: "diez", sv: "tio", en: "ten" },
      { es: "veinte", sv: "tjugo", en: "twenty" },
      { es: "cien", sv: "hundra", en: "one hundred" },
      { es: "mil", sv: "tusen", en: "one thousand" },
    ],
  },
  {
    id: "colors",
    label: { sv: "Färger", en: "Colors" },
    level: "A1", difficulty: 1,
    grammarTags: ["adjective-agreement"], vocabularyTags: ["colors"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "rojo", sv: "röd", en: "red" },
      { es: "azul", sv: "blå", en: "blue" },
      { es: "verde", sv: "grön", en: "green" },
      { es: "amarillo", sv: "gul", en: "yellow" },
      { es: "blanco", sv: "vit", en: "white" },
      { es: "negro", sv: "svart", en: "black" },
      { es: "naranja", sv: "orange", en: "orange" },
      { es: "rosa", sv: "rosa", en: "pink" },
      { es: "marrón", sv: "brun", en: "brown" },
      { es: "gris", sv: "grå", en: "grey" },
    ],
  },
  {
    id: "weekdays",
    label: { sv: "Veckodagar", en: "Weekdays" },
    level: "A1", difficulty: 1,
    grammarTags: [], vocabularyTags: ["time", "weekdays"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "lunes", sv: "måndag", en: "Monday" },
      { es: "martes", sv: "tisdag", en: "Tuesday" },
      { es: "miércoles", sv: "onsdag", en: "Wednesday" },
      { es: "jueves", sv: "torsdag", en: "Thursday" },
      { es: "viernes", sv: "fredag", en: "Friday" },
      { es: "sábado", sv: "lördag", en: "Saturday" },
      { es: "domingo", sv: "söndag", en: "Sunday" },
    ],
  },
  {
    id: "months",
    label: { sv: "Månader", en: "Months" },
    level: "A1", difficulty: 1,
    grammarTags: [], vocabularyTags: ["time", "months"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "enero", sv: "januari", en: "January" },
      { es: "febrero", sv: "februari", en: "February" },
      { es: "marzo", sv: "mars", en: "March" },
      { es: "abril", sv: "april", en: "April" },
      { es: "mayo", sv: "maj", en: "May" },
      { es: "junio", sv: "juni", en: "June" },
      { es: "julio", sv: "juli", en: "July" },
      { es: "agosto", sv: "augusti", en: "August" },
      { es: "septiembre", sv: "september", en: "September" },
      { es: "octubre", sv: "oktober", en: "October" },
      { es: "noviembre", sv: "november", en: "November" },
      { es: "diciembre", sv: "december", en: "December" },
    ],
  },
  {
    id: "time-basics",
    label: { sv: "Klockan", en: "Telling time" },
    level: "A1", difficulty: 2,
    grammarTags: ["ser"], vocabularyTags: ["time"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "¿Qué hora es?", sv: "Vad är klockan?", en: "What time is it?" },
      { es: "Es la una", sv: "Klockan är ett", en: "It's one o'clock" },
      { es: "Son las dos", sv: "Klockan är två", en: "It's two o'clock" },
      { es: "Son las tres y media", sv: "Klockan är halv fyra", en: "It's half past three" },
      { es: "Son las cuatro y cuarto", sv: "Klockan är kvart över fyra", en: "It's quarter past four" },
      { es: "Son las cinco menos cuarto", sv: "Klockan är kvart i fem", en: "It's quarter to five" },
      { es: "la mañana", sv: "morgonen", en: "morning" },
      { es: "la tarde", sv: "eftermiddagen", en: "afternoon" },
      { es: "la noche", sv: "natten/kvällen", en: "night/evening" },
    ],
  },
  {
    id: "family",
    label: { sv: "Familj", en: "Family" },
    level: "A1", difficulty: 2,
    grammarTags: ["possessives"], vocabularyTags: ["family"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la madre", sv: "mamman", en: "the mother" },
      { es: "el padre", sv: "pappan", en: "the father" },
      { es: "el hermano", sv: "brodern", en: "the brother" },
      { es: "la hermana", sv: "systern", en: "the sister" },
      { es: "el abuelo", sv: "farfar/morfar", en: "the grandfather" },
      { es: "la abuela", sv: "farmor/mormor", en: "the grandmother" },
      { es: "el hijo", sv: "sonen", en: "the son" },
      { es: "la hija", sv: "dottern", en: "the daughter" },
      { es: "el tío", sv: "farbror/morbror", en: "the uncle" },
      { es: "la tía", sv: "faster/moster", en: "the aunt" },
    ],
  },
  {
    id: "common-food",
    label: { sv: "Mat & dryck", en: "Food & drink" },
    level: "A1", difficulty: 2,
    grammarTags: ["articles"], vocabularyTags: ["food"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el agua", sv: "vatten", en: "water" },
      { es: "el pan", sv: "bröd", en: "bread" },
      { es: "la leche", sv: "mjölk", en: "milk" },
      { es: "el café", sv: "kaffe", en: "coffee" },
      { es: "la fruta", sv: "frukt", en: "fruit" },
      { es: "la manzana", sv: "äpple", en: "apple" },
      { es: "el arroz", sv: "ris", en: "rice" },
      { es: "el pollo", sv: "kyckling", en: "chicken" },
      { es: "la ensalada", sv: "sallad", en: "salad" },
      { es: "el queso", sv: "ost", en: "cheese" },
    ],
  },
  {
    id: "simple-directions",
    label: { sv: "Riktningar", en: "Directions" },
    level: "A1", difficulty: 3,
    grammarTags: ["imperative-basics"], vocabularyTags: ["directions"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "a la derecha", sv: "till höger", en: "to the right" },
      { es: "a la izquierda", sv: "till vänster", en: "to the left" },
      { es: "recto / derecho", sv: "rakt fram", en: "straight ahead" },
      { es: "cerca", sv: "nära", en: "near" },
      { es: "lejos", sv: "långt borta", en: "far" },
      { es: "aquí", sv: "här", en: "here" },
      { es: "allí", sv: "där", en: "there" },
      { es: "la calle", sv: "gatan", en: "the street" },
    ],
  },
  {
    id: "basic-verbs",
    label: { sv: "Grundverb", en: "Basic verbs" },
    level: "A1", difficulty: 2,
    grammarTags: ["present-tense", "ser", "estar", "tener", "ir"],
    vocabularyTags: ["verbs"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "ser", sv: "vara (egenskap)", en: "to be (trait)" },
      { es: "estar", sv: "vara (tillstånd)", en: "to be (state)" },
      { es: "tener", sv: "ha", en: "to have" },
      { es: "ir", sv: "gå / åka", en: "to go" },
      { es: "hacer", sv: "göra", en: "to do / to make" },
      { es: "querer", sv: "vilja", en: "to want" },
      { es: "poder", sv: "kunna", en: "to be able to" },
      { es: "hablar", sv: "tala", en: "to speak" },
      { es: "comer", sv: "äta", en: "to eat" },
      { es: "vivir", sv: "leva / bo", en: "to live" },
    ],
  },
  {
    id: "question-words",
    label: { sv: "Frågeord", en: "Question words" },
    level: "A1", difficulty: 2,
    grammarTags: ["interrogatives"], vocabularyTags: ["question-words"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "¿Qué?", sv: "Vad?", en: "What?" },
      { es: "¿Quién?", sv: "Vem?", en: "Who?" },
      { es: "¿Dónde?", sv: "Var?", en: "Where?" },
      { es: "¿Cuándo?", sv: "När?", en: "When?" },
      { es: "¿Cómo?", sv: "Hur?", en: "How?" },
      { es: "¿Por qué?", sv: "Varför?", en: "Why?" },
      { es: "¿Cuánto?", sv: "Hur mycket?", en: "How much?" },
      { es: "¿Cuál?", sv: "Vilken?", en: "Which?" },
    ],
  },
  {
    id: "classroom",
    label: { sv: "I klassrummet", en: "In the classroom" },
    level: "A1", difficulty: 2,
    grammarTags: [], vocabularyTags: ["classroom"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el libro", sv: "boken", en: "the book" },
      { es: "el bolígrafo", sv: "pennan", en: "the pen" },
      { es: "el cuaderno", sv: "anteckningsboken", en: "the notebook" },
      { es: "la mesa", sv: "bordet", en: "the table" },
      { es: "la silla", sv: "stolen", en: "the chair" },
      { es: "el profesor", sv: "läraren", en: "the teacher" },
      { es: "el estudiante", sv: "eleven", en: "the student" },
    ],
  },
  {
    id: "body-parts",
    label: { sv: "Kroppen", en: "Body parts" },
    level: "A1", difficulty: 3,
    grammarTags: ["articles"], vocabularyTags: ["body"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la cabeza", sv: "huvudet", en: "the head" },
      { es: "el brazo", sv: "armen", en: "the arm" },
      { es: "la mano", sv: "handen", en: "the hand" },
      { es: "la pierna", sv: "benet", en: "the leg" },
      { es: "el pie", sv: "foten", en: "the foot" },
      { es: "el ojo", sv: "ögat", en: "the eye" },
      { es: "la boca", sv: "munnen", en: "the mouth" },
      { es: "la nariz", sv: "näsan", en: "the nose" },
    ],
  },

  // ═══════════════ A2 ═══════════════
  {
    id: "shopping",
    label: { sv: "Shopping", en: "Shopping" },
    level: "A2", difficulty: 1,
    grammarTags: ["comparatives"], vocabularyTags: ["shopping"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "¿Cuánto cuesta?", sv: "Hur mycket kostar det?", en: "How much does it cost?" },
      { es: "Me gustaría comprar…", sv: "Jag skulle vilja köpa…", en: "I would like to buy…" },
      { es: "la tienda", sv: "affären", en: "the store" },
      { es: "el precio", sv: "priset", en: "the price" },
      { es: "barato", sv: "billigt", en: "cheap" },
      { es: "caro", sv: "dyrt", en: "expensive" },
      { es: "la talla", sv: "storleken", en: "the size" },
      { es: "pagar", sv: "betala", en: "to pay" },
    ],
  },
  {
    id: "restaurant",
    label: { sv: "Restaurangen", en: "Restaurant" },
    level: "A2", difficulty: 1,
    grammarTags: ["conditional-polite"], vocabularyTags: ["food", "restaurant"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la carta / el menú", sv: "menyn", en: "the menu" },
      { es: "Quisiera…", sv: "Jag skulle vilja…", en: "I would like…" },
      { es: "La cuenta, por favor", sv: "Notan, tack", en: "The bill, please" },
      { es: "el camarero", sv: "servitören", en: "the waiter" },
      { es: "la propina", sv: "dricksen", en: "the tip" },
      { es: "de primero", sv: "som förrätt", en: "as a starter" },
      { es: "de segundo", sv: "som huvudrätt", en: "as a main course" },
      { es: "de postre", sv: "som efterrätt", en: "for dessert" },
    ],
  },
  {
    id: "daily-routines",
    label: { sv: "Vardagsrutiner", en: "Daily routines" },
    level: "A2", difficulty: 1,
    grammarTags: ["reflexive-verbs", "present-tense"], vocabularyTags: ["routines"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "despertarse", sv: "vakna", en: "to wake up" },
      { es: "levantarse", sv: "gå upp", en: "to get up" },
      { es: "ducharse", sv: "duscha", en: "to shower" },
      { es: "desayunar", sv: "äta frukost", en: "to have breakfast" },
      { es: "almorzar", sv: "äta lunch", en: "to have lunch" },
      { es: "cenar", sv: "äta middag", en: "to have dinner" },
      { es: "acostarse", sv: "lägga sig", en: "to go to bed" },
    ],
  },
  {
    id: "travel-basics",
    label: { sv: "Resor", en: "Travel" },
    level: "A2", difficulty: 2,
    grammarTags: ["ir-a-infinitive"], vocabularyTags: ["travel"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "pronunciation"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el aeropuerto", sv: "flygplatsen", en: "the airport" },
      { es: "el billete", sv: "biljetten", en: "the ticket" },
      { es: "el hotel", sv: "hotellet", en: "the hotel" },
      { es: "la maleta", sv: "resväskan", en: "the suitcase" },
      { es: "el pasaporte", sv: "passet", en: "the passport" },
      { es: "reservar", sv: "boka", en: "to book" },
      { es: "la playa", sv: "stranden", en: "the beach" },
      { es: "el tren", sv: "tåget", en: "the train" },
    ],
  },
  {
    id: "weather",
    label: { sv: "Väder", en: "Weather" },
    level: "A2", difficulty: 1,
    grammarTags: ["hacer-weather"], vocabularyTags: ["weather"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Hace sol", sv: "Det är soligt", en: "It's sunny" },
      { es: "Hace frío", sv: "Det är kallt", en: "It's cold" },
      { es: "Hace calor", sv: "Det är varmt", en: "It's hot" },
      { es: "Llueve", sv: "Det regnar", en: "It's raining" },
      { es: "Nieva", sv: "Det snöar", en: "It's snowing" },
      { es: "Está nublado", sv: "Det är molnigt", en: "It's cloudy" },
      { es: "el viento", sv: "vinden", en: "the wind" },
    ],
  },
  {
    id: "hobbies",
    label: { sv: "Hobbyer", en: "Hobbies" },
    level: "A2", difficulty: 1,
    grammarTags: ["gustar"], vocabularyTags: ["hobbies"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Me gusta…", sv: "Jag gillar…", en: "I like…" },
      { es: "leer", sv: "läsa", en: "to read" },
      { es: "nadar", sv: "simma", en: "to swim" },
      { es: "cocinar", sv: "laga mat", en: "to cook" },
      { es: "bailar", sv: "dansa", en: "to dance" },
      { es: "jugar al fútbol", sv: "spela fotboll", en: "to play football" },
      { es: "escuchar música", sv: "lyssna på musik", en: "to listen to music" },
      { es: "ver películas", sv: "titta på filmer", en: "to watch movies" },
    ],
  },
  {
    id: "health",
    label: { sv: "Hälsa", en: "Health" },
    level: "A2", difficulty: 2,
    grammarTags: ["doler"], vocabularyTags: ["health"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Me duele la cabeza", sv: "Jag har ont i huvudet", en: "My head hurts" },
      { es: "el médico", sv: "läkaren", en: "the doctor" },
      { es: "la farmacia", sv: "apoteket", en: "the pharmacy" },
      { es: "la fiebre", sv: "feber", en: "fever" },
      { es: "estar enfermo/a", sv: "vara sjuk", en: "to be sick" },
      { es: "la receta", sv: "receptet", en: "the prescription" },
    ],
  },
  {
    id: "housing",
    label: { sv: "Boende", en: "Housing" },
    level: "A2", difficulty: 2,
    grammarTags: ["hay", "estar-location"], vocabularyTags: ["housing"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la cocina", sv: "köket", en: "the kitchen" },
      { es: "el dormitorio", sv: "sovrummet", en: "the bedroom" },
      { es: "el baño", sv: "badrummet", en: "the bathroom" },
      { es: "el salón", sv: "vardagsrummet", en: "the living room" },
      { es: "el jardín", sv: "trädgården", en: "the garden" },
      { es: "el piso", sv: "lägenheten", en: "the apartment" },
    ],
  },
  {
    id: "professions",
    label: { sv: "Yrken", en: "Professions" },
    level: "A2", difficulty: 2,
    grammarTags: ["ser"], vocabularyTags: ["professions"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el profesor / la profesora", sv: "läraren", en: "the teacher" },
      { es: "el médico / la médica", sv: "läkaren", en: "the doctor" },
      { es: "el abogado / la abogada", sv: "advokaten", en: "the lawyer" },
      { es: "el cocinero / la cocinera", sv: "kocken", en: "the cook" },
      { es: "el ingeniero / la ingeniera", sv: "ingenjören", en: "the engineer" },
      { es: "el policía / la policía", sv: "polisen", en: "the police officer" },
    ],
  },
  {
    id: "past-tense-basics",
    label: { sv: "Dåtid (preteritum)", en: "Past tense basics" },
    level: "A2", difficulty: 3,
    grammarTags: ["preterite"], vocabularyTags: ["verbs"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Ayer comí paella", sv: "Igår åt jag paella", en: "Yesterday I ate paella" },
      { es: "Fui al cine", sv: "Jag gick på bio", en: "I went to the cinema" },
      { es: "Hablé con mi amigo", sv: "Jag pratade med min vän", en: "I spoke with my friend" },
      { es: "Compré un libro", sv: "Jag köpte en bok", en: "I bought a book" },
      { es: "Viví en España", sv: "Jag bodde i Spanien", en: "I lived in Spain" },
    ],
  },
  {
    id: "future-basics",
    label: { sv: "Framtid (ir a + infinitiv)", en: "Future basics" },
    level: "A2", difficulty: 3,
    grammarTags: ["ir-a-infinitive"], vocabularyTags: ["verbs"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Voy a estudiar", sv: "Jag ska studera", en: "I'm going to study" },
      { es: "Vamos a viajar", sv: "Vi ska resa", en: "We're going to travel" },
      { es: "Va a llover", sv: "Det ska regna", en: "It's going to rain" },
      { es: "Voy a comer", sv: "Jag ska äta", en: "I'm going to eat" },
    ],
  },

  // ═══════════════ B1 ═══════════════
  {
    id: "opinions",
    label: { sv: "Åsikter", en: "Opinions" },
    level: "B1", difficulty: 1,
    grammarTags: ["subjunctive-opinion"], vocabularyTags: ["opinions"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion", "mixed-quiz"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Creo que…", sv: "Jag tror att…", en: "I think that…" },
      { es: "En mi opinión…", sv: "Enligt min åsikt…", en: "In my opinion…" },
      { es: "Estoy de acuerdo", sv: "Jag håller med", en: "I agree" },
      { es: "No estoy de acuerdo", sv: "Jag håller inte med", en: "I disagree" },
      { es: "Me parece que…", sv: "Det verkar som att…", en: "It seems to me that…" },
    ],
  },
  {
    id: "narration",
    label: { sv: "Berättande", en: "Narration" },
    level: "B1", difficulty: 2,
    grammarTags: ["imperfect", "preterite-vs-imperfect"], vocabularyTags: ["narration"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Cuando era niño…", sv: "När jag var barn…", en: "When I was a child…" },
      { es: "De repente…", sv: "Plötsligt…", en: "Suddenly…" },
      { es: "Mientras…", sv: "Medan…", en: "While…" },
      { es: "Entonces…", sv: "Då…", en: "Then…" },
      { es: "Después…", sv: "Sedan…", en: "After…" },
    ],
  },
  {
    id: "comparison",
    label: { sv: "Jämförelser", en: "Comparisons" },
    level: "B1", difficulty: 1,
    grammarTags: ["comparatives", "superlatives"], vocabularyTags: ["comparison"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "más … que", sv: "mer … än", en: "more … than" },
      { es: "menos … que", sv: "mindre … än", en: "less … than" },
      { es: "tan … como", sv: "lika … som", en: "as … as" },
      { es: "mejor", sv: "bättre", en: "better" },
      { es: "peor", sv: "sämre", en: "worse" },
      { es: "el/la más …", sv: "den mest …", en: "the most …" },
    ],
  },
  {
    id: "environment",
    label: { sv: "Miljö & natur", en: "Environment" },
    level: "B1", difficulty: 2,
    grammarTags: [], vocabularyTags: ["environment"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el medio ambiente", sv: "miljön", en: "the environment" },
      { es: "reciclar", sv: "återvinna", en: "to recycle" },
      { es: "la contaminación", sv: "föroreningarna", en: "the pollution" },
      { es: "el cambio climático", sv: "klimatförändringen", en: "climate change" },
      { es: "ahorrar energía", sv: "spara energi", en: "to save energy" },
    ],
  },
  {
    id: "media",
    label: { sv: "Media & teknik", en: "Media & technology" },
    level: "B1", difficulty: 2,
    grammarTags: [], vocabularyTags: ["media", "technology"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el ordenador", sv: "datorn", en: "the computer" },
      { es: "el teléfono móvil", sv: "mobiltelefonen", en: "the mobile phone" },
      { es: "las redes sociales", sv: "sociala medier", en: "social media" },
      { es: "buscar en internet", sv: "söka på internet", en: "to search the internet" },
      { es: "descargar", sv: "ladda ner", en: "to download" },
    ],
  },
  {
    id: "education",
    label: { sv: "Utbildning", en: "Education" },
    level: "B1", difficulty: 2,
    grammarTags: [], vocabularyTags: ["education"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la universidad", sv: "universitetet", en: "the university" },
      { es: "la carrera", sv: "utbildningen", en: "the degree" },
      { es: "aprobar un examen", sv: "klara ett prov", en: "to pass an exam" },
      { es: "suspender", sv: "bli underkänd", en: "to fail" },
      { es: "la beca", sv: "stipendiet", en: "the scholarship" },
    ],
  },
  {
    id: "subjunctive-intro",
    label: { sv: "Konjunktiv (intro)", en: "Subjunctive (intro)" },
    level: "B1", difficulty: 3,
    grammarTags: ["subjunctive"], vocabularyTags: [],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Quiero que vengas", sv: "Jag vill att du kommer", en: "I want you to come" },
      { es: "Espero que estés bien", sv: "Jag hoppas att du mår bra", en: "I hope you're well" },
      { es: "Es importante que estudies", sv: "Det är viktigt att du studerar", en: "It's important that you study" },
    ],
  },
  {
    id: "conditional",
    label: { sv: "Konditionalis", en: "Conditional" },
    level: "B1", difficulty: 3,
    grammarTags: ["conditional"], vocabularyTags: [],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Me gustaría…", sv: "Jag skulle vilja…", en: "I would like…" },
      { es: "Podría ayudarme", sv: "Kan du hjälpa mig", en: "Could you help me" },
      { es: "Si tuviera dinero, viajaría", sv: "Om jag hade pengar skulle jag resa", en: "If I had money, I would travel" },
    ],
  },

  // ═══════════════ B2 ═══════════════
  {
    id: "abstract-ideas",
    label: { sv: "Abstrakta idéer", en: "Abstract ideas" },
    level: "B2", difficulty: 1,
    grammarTags: [], vocabularyTags: ["abstract"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion", "mixed-quiz"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la libertad", sv: "friheten", en: "freedom" },
      { es: "la justicia", sv: "rättvisan", en: "justice" },
      { es: "la igualdad", sv: "jämlikheten", en: "equality" },
      { es: "el desarrollo", sv: "utvecklingen", en: "development" },
    ],
  },
  {
    id: "idioms",
    label: { sv: "Idiom & uttryck", en: "Idioms & expressions" },
    level: "B2", difficulty: 2,
    grammarTags: [], vocabularyTags: ["idioms"],
    exerciseModes: ["flashcards", "multiple-choice", "typing"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Estar en las nubes", sv: "Vara i det blå", en: "To have one's head in the clouds" },
      { es: "Costar un ojo de la cara", sv: "Kosta skjortan", en: "To cost an arm and a leg" },
      { es: "Meter la pata", sv: "Trampa i klaveret", en: "To put one's foot in it" },
      { es: "No tener pelos en la lengua", sv: "Inte ha hår på tungan", en: "To not mince words" },
    ],
  },
  {
    id: "debate",
    label: { sv: "Debatt & argument", en: "Debate & arguments" },
    level: "B2", difficulty: 2,
    grammarTags: ["subjunctive", "conditional"], vocabularyTags: ["debate"],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Sin embargo…", sv: "Dock…", en: "However…" },
      { es: "Por un lado… por otro lado…", sv: "Å ena sidan… å andra sidan…", en: "On one hand… on the other hand…" },
      { es: "En conclusión…", sv: "Sammanfattningsvis…", en: "In conclusion…" },
    ],
  },
  {
    id: "culture",
    label: { sv: "Kultur & samhälle", en: "Culture & society" },
    level: "B2", difficulty: 2,
    grammarTags: [], vocabularyTags: ["culture"],
    exerciseModes: ["flashcards", "multiple-choice", "typing", "mixed-quiz"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la costumbre", sv: "seden", en: "the custom" },
      { es: "la tradición", sv: "traditionen", en: "the tradition" },
      { es: "el patrimonio", sv: "kulturarvet", en: "the heritage" },
      { es: "la diversidad", sv: "mångfalden", en: "diversity" },
    ],
  },
  {
    id: "advanced-subjunctive",
    label: { sv: "Avancerad konjunktiv", en: "Advanced subjunctive" },
    level: "B2", difficulty: 3,
    grammarTags: ["subjunctive-imperfect", "subjunctive-pluperfect"], vocabularyTags: [],
    exerciseModes: ["multiple-choice", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Si hubiera sabido…", sv: "Om jag hade vetat…", en: "If I had known…" },
      { es: "Ojalá pudiera…", sv: "Om jag bara kunde…", en: "I wish I could…" },
    ],
  },
  {
    id: "formal-writing",
    label: { sv: "Formellt skrivande", en: "Formal writing" },
    level: "B2", difficulty: 3,
    grammarTags: [], vocabularyTags: ["formal"],
    exerciseModes: ["typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "Estimado/a señor/a", sv: "Bästa herr/fru", en: "Dear Sir/Madam" },
      { es: "Le escribo para…", sv: "Jag skriver till er för att…", en: "I am writing to you to…" },
      { es: "Atentamente", sv: "Med vänliga hälsningar", en: "Sincerely" },
    ],
  },

  // ═══════════════ C1 ═══════════════
  {
    id: "academic-language",
    label: { sv: "Akademiskt språk", en: "Academic language" },
    level: "C1", difficulty: 1,
    grammarTags: [], vocabularyTags: ["academic"],
    exerciseModes: ["typing", "sentence-completion", "mixed-quiz"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "según los datos", sv: "enligt uppgifterna", en: "according to the data" },
      { es: "cabe destacar que", sv: "det bör framhållas att", en: "it should be noted that" },
      { es: "a raíz de", sv: "till följd av", en: "as a result of" },
    ],
  },
  {
    id: "literary-analysis",
    label: { sv: "Litterär analys", en: "Literary analysis" },
    level: "C1", difficulty: 2,
    grammarTags: [], vocabularyTags: ["literature"],
    exerciseModes: ["typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "el protagonista", sv: "huvudpersonen", en: "the protagonist" },
      { es: "la trama", sv: "handlingen", en: "the plot" },
      { es: "el desenlace", sv: "upplösningen", en: "the ending/resolution" },
    ],
  },
  {
    id: "professional-spanish",
    label: { sv: "Professionell spanska", en: "Professional Spanish" },
    level: "C1", difficulty: 2,
    grammarTags: [], vocabularyTags: ["professional"],
    exerciseModes: ["typing", "sentence-completion", "mixed-quiz"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "la reunión", sv: "mötet", en: "the meeting" },
      { es: "el presupuesto", sv: "budgeten", en: "the budget" },
      { es: "negociar", sv: "förhandla", en: "to negotiate" },
      { es: "el plazo", sv: "deadline", en: "the deadline" },
    ],
  },
  {
    id: "regional-varieties",
    label: { sv: "Regionala varianter", en: "Regional varieties" },
    level: "C1", difficulty: 3,
    grammarTags: ["voseo"], vocabularyTags: ["regional"],
    exerciseModes: ["flashcards", "multiple-choice", "mixed-quiz"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "coche (ES) / carro (LAm)", sv: "bil", en: "car" },
      { es: "ordenador (ES) / computadora (LAm)", sv: "dator", en: "computer" },
      { es: "vale (ES) / dale (Arg)", sv: "okej", en: "okay" },
    ],
  },

  // ═══════════════ C2 ═══════════════
  {
    id: "mastery-review",
    label: { sv: "Mästarrepetition", en: "Mastery review" },
    level: "C2", difficulty: 1,
    grammarTags: [], vocabularyTags: [],
    exerciseModes: ["mixed-quiz", "typing", "sentence-completion"],
    freestyle: true, review: true, challenge: false,
    sampleContent: [
      { es: "a sabiendas de que", sv: "med vetskapen om att", en: "knowing full well that" },
      { es: "en aras de", sv: "för … skull", en: "for the sake of" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

/** Get all topics for a specific level */
export const getTopicsForLevel = (level: Level): CurriculumTopic[] =>
  TOPICS.filter((t) => t.level === level);

/** Get freestyle-available topics for a level (+ optionally lower levels for review) */
export const getFreestyleTopics = (level: Level, includeReview = false): CurriculumTopic[] => {
  const idx = LEVEL_ORDER.indexOf(level);
  return TOPICS.filter((t) => {
    const tIdx = LEVEL_ORDER.indexOf(t.level);
    if (!t.freestyle) return false;
    if (tIdx === idx) return true;
    if (includeReview && tIdx < idx && t.review) return true;
    return false;
  });
};

/** Get challenge topics (one level above current) */
export const getChallengeTopics = (level: Level): CurriculumTopic[] => {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx >= LEVEL_ORDER.length - 1) return [];
  const nextLevel = LEVEL_ORDER[idx + 1];
  return TOPICS.filter((t) => t.level === nextLevel && t.challenge !== false);
};

/** Find a topic by id */
export const getTopicById = (id: string): CurriculumTopic | undefined =>
  TOPICS.find((t) => t.id === id);

/** Get level meta */
export const getLevelMeta = (level: Level): LevelMeta | undefined =>
  LEVELS.find((l) => l.level === level);

/** Get all available levels up to and including the given level */
export const getAvailableLevels = (currentLevel: Level): Level[] => {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  return LEVEL_ORDER.slice(0, idx + 1);
};
