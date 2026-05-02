// Mock learning content used while the api-server lacks dedicated
// grammar-lesson / reading-passage endpoints. Replace with API calls when
// those endpoints land. See README "Phase 3 — Remaining gaps".
// TODO(api): move this to api-server (e.g. /grammar-lessons, /reading-passages).

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface GrammarMcQuestion {
  id: string;
  prompt: { es: string; en: string; sv: string };
  options: string[];
  answer: string;
  explanation?: { en: string; sv: string };
}

export interface GrammarLesson {
  id: string;
  level: Level;
  title: { en: string; sv: string };
  summary: { en: string; sv: string };
  explanation: { en: string; sv: string };
  examples: { es: string; en: string; sv: string }[];
  questions: GrammarMcQuestion[];
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: "a1-greetings",
    level: "A1",
    title: { en: "Greetings", sv: "Hälsningar" },
    summary: {
      en: "Say hello, goodbye, and ask how someone is doing.",
      sv: "Säg hej, hej då och fråga hur det går.",
    },
    explanation: {
      en: "Spanish greetings change with time of day: buenos días (morning), buenas tardes (afternoon), buenas noches (evening/night). For casual hellos use hola, and to ask how someone is use ¿cómo estás? (informal) or ¿cómo está? (formal).",
      sv: "Spanska hälsningar varierar beroende på tid på dagen: buenos días (morgon), buenas tardes (eftermiddag), buenas noches (kväll/natt). För avslappnat hej används hola, och för att fråga hur det går säger man ¿cómo estás? (informellt) eller ¿cómo está? (formellt).",
    },
    examples: [
      { es: "Hola, ¿cómo estás?", en: "Hi, how are you?", sv: "Hej, hur mår du?" },
      { es: "Buenos días.", en: "Good morning.", sv: "God morgon." },
      { es: "Adiós, hasta luego.", en: "Goodbye, see you later.", sv: "Hej då, vi ses." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "¿Cómo se dice 'good morning'?",
          en: "How do you say 'good morning'?",
          sv: "Hur säger man 'god morgon'?",
        },
        options: ["Buenas noches", "Buenos días", "Buenas tardes", "Hola"],
        answer: "Buenos días",
      },
      {
        id: "q2",
        prompt: {
          es: "Choose the informal way to ask 'how are you'.",
          en: "Choose the informal way to ask 'how are you'.",
          sv: "Välj det informella sättet att fråga 'hur mår du'.",
        },
        options: ["¿Cómo está usted?", "¿Cómo estás?", "¿Qué tal el señor?", "Adiós"],
        answer: "¿Cómo estás?",
      },
    ],
  },
  {
    id: "a1-articles",
    level: "A1",
    title: { en: "Articles & Gender", sv: "Artiklar och genus" },
    summary: {
      en: "Definite (el/la/los/las) and indefinite (un/una/unos/unas) articles.",
      sv: "Bestämda (el/la/los/las) och obestämda (un/una/unos/unas) artiklar.",
    },
    explanation: {
      en: "Spanish nouns are masculine or feminine. El/la = the, un/una = a/an. Most -o nouns are masculine; most -a nouns are feminine.",
      sv: "Spanska substantiv är maskulina eller feminina. El/la = den/det, un/una = en/ett. De flesta -o-ord är maskulina; de flesta -a-ord är feminina.",
    },
    examples: [
      { es: "el libro", en: "the book", sv: "boken" },
      { es: "la mesa", en: "the table", sv: "bordet" },
      { es: "un perro", en: "a dog", sv: "en hund" },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "Choose the correct article: ___ casa",
          en: "Choose the correct article: ___ casa (house)",
          sv: "Välj rätt artikel: ___ casa (hus)",
        },
        options: ["el", "la", "los", "un"],
        answer: "la",
      },
      {
        id: "q2",
        prompt: {
          es: "Choose the correct article: ___ libro",
          en: "Choose the correct article: ___ libro (book)",
          sv: "Välj rätt artikel: ___ libro (bok)",
        },
        options: ["la", "el", "una", "las"],
        answer: "el",
      },
    ],
  },
  {
    id: "a2-present",
    level: "A2",
    title: { en: "Present Tense — Regular Verbs", sv: "Presens — regelbundna verb" },
    summary: {
      en: "Conjugate -ar, -er, -ir verbs in the present tense.",
      sv: "Böj verb på -ar, -er, -ir i presens.",
    },
    explanation: {
      en: "Drop the infinitive ending and add the personal endings. For -ar verbs (hablar): -o, -as, -a, -amos, -áis, -an. For -er/-ir verbs the endings differ slightly.",
      sv: "Ta bort infinitivändelsen och lägg till personändelsen. För -ar-verb (hablar): -o, -as, -a, -amos, -áis, -an. -er/-ir har lite andra ändelser.",
    },
    examples: [
      { es: "Yo hablo español.", en: "I speak Spanish.", sv: "Jag talar spanska." },
      { es: "Tú comes pan.", en: "You eat bread.", sv: "Du äter bröd." },
      { es: "Nosotros vivimos en Madrid.", en: "We live in Madrid.", sv: "Vi bor i Madrid." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Yo ___ (hablar) español.'",
          en: "Conjugate: 'Yo ___ (hablar) español.'",
          sv: "Böj: 'Yo ___ (hablar) español.'",
        },
        options: ["hablo", "hablas", "habla", "hablamos"],
        answer: "hablo",
      },
      {
        id: "q2",
        prompt: {
          es: "'Ellos ___ (comer) pizza.'",
          en: "Conjugate: 'Ellos ___ (comer) pizza.'",
          sv: "Böj: 'Ellos ___ (comer) pizza.'",
        },
        options: ["comen", "come", "comes", "comemos"],
        answer: "comen",
      },
    ],
  },
  {
    id: "b1-preterite",
    level: "B1",
    title: { en: "Preterite Tense", sv: "Preteritum" },
    summary: {
      en: "Talk about completed actions in the past.",
      sv: "Prata om avslutade handlingar i förfluten tid.",
    },
    explanation: {
      en: "Use the preterite for actions that have a clear beginning and end. Regular -ar endings: -é, -aste, -ó, -amos, -asteis, -aron.",
      sv: "Använd preteritum för handlingar med tydlig början och slut. Regelbundna -ar-ändelser: -é, -aste, -ó, -amos, -asteis, -aron.",
    },
    examples: [
      { es: "Ayer hablé con María.", en: "Yesterday I spoke with María.", sv: "Igår pratade jag med María." },
      { es: "Comí paella anoche.", en: "I ate paella last night.", sv: "Jag åt paella igår kväll." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Ayer yo ___ (comer) tapas.'",
          en: "Conjugate: 'Ayer yo ___ (comer) tapas.'",
          sv: "Böj: 'Ayer yo ___ (comer) tapas.'",
        },
        options: ["comí", "como", "comía", "comeré"],
        answer: "comí",
      },
    ],
  },
  {
    id: "b2-subjunctive",
    level: "B2",
    title: { en: "Present Subjunctive", sv: "Presens konjunktiv" },
    summary: {
      en: "Express wishes, doubts, and emotion.",
      sv: "Uttryck önskningar, tvivel och känslor.",
    },
    explanation: {
      en: "Use the subjunctive after expressions like 'quiero que', 'es importante que', 'dudo que'. Endings often mirror the opposite vowel of the indicative.",
      sv: "Använd konjunktiv efter uttryck som 'quiero que', 'es importante que', 'dudo que'. Ändelserna är ofta motsatt vokal jämfört med indikativ.",
    },
    examples: [
      { es: "Quiero que vengas.", en: "I want you to come.", sv: "Jag vill att du kommer." },
      { es: "Es importante que estudies.", en: "It's important that you study.", sv: "Det är viktigt att du pluggar." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Espero que ___ (venir) pronto.'",
          en: "Conjugate (subjunctive): 'Espero que tú ___ (venir) pronto.'",
          sv: "Böj (konjunktiv): 'Espero que tú ___ (venir) pronto.'",
        },
        options: ["vienes", "vengas", "vendrás", "vinieras"],
        answer: "vengas",
      },
    ],
  },
  {
    id: "c1-conditional",
    level: "C1",
    title: { en: "Conditional Sentences", sv: "Villkorssatser" },
    summary: {
      en: "If-clauses with the conditional mood.",
      sv: "Om-satser med konditionalis.",
    },
    explanation: {
      en: "Type 2 conditional: 'Si + imperfect subjunctive, conditional'. Example: Si tuviera tiempo, viajaría.",
      sv: "Typ 2-villkor: 'Si + imperfekt konjunktiv, konditionalis'. Exempel: Si tuviera tiempo, viajaría.",
    },
    examples: [
      { es: "Si pudiera, lo haría.", en: "If I could, I would do it.", sv: "Om jag kunde skulle jag göra det." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Si tuviera dinero, ___ (viajar) por el mundo.'",
          en: "Choose the conditional form.",
          sv: "Välj konditionalformen.",
        },
        options: ["viajo", "viajaba", "viajaría", "viajara"],
        answer: "viajaría",
      },
    ],
  },
  {
    id: "c2-style",
    level: "C2",
    title: { en: "Advanced Register & Idioms", sv: "Avancerad stil och idiom" },
    summary: {
      en: "Choose the right register and use idiomatic Spanish naturally.",
      sv: "Välj rätt språkligt register och använd spanska idiom naturligt.",
    },
    explanation: {
      en: "Mastery means switching effortlessly between formal and colloquial Spanish, and using idioms (e.g. 'estar en las nubes' = to be daydreaming) in context.",
      sv: "Behärskning innebär att skifta obehindrat mellan formell och vardaglig spanska och att använda idiom (t.ex. 'estar en las nubes' = att drömma sig bort) i sammanhang.",
    },
    examples: [
      { es: "Está en las nubes.", en: "He's daydreaming.", sv: "Han drömmer sig bort." },
      { es: "Cuesta un ojo de la cara.", en: "It costs an arm and a leg.", sv: "Det kostar skjortan." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "What does 'cuesta un ojo de la cara' mean?",
          en: "What does 'cuesta un ojo de la cara' mean?",
          sv: "Vad betyder 'cuesta un ojo de la cara'?",
        },
        options: [
          "It's a bargain",
          "It costs an arm and a leg",
          "It's worth a try",
          "It hurts my eye",
        ],
        answer: "It costs an arm and a leg",
      },
    ],
  },
];

export interface ReadingQuestion {
  id: string;
  prompt: { en: string; sv: string };
  options: string[];
  answer: string;
}

export interface ReadingPassage {
  id: string;
  level: Level;
  title: { en: string; sv: string };
  text: string; // always Spanish
  translation: { en: string; sv: string };
  questions: ReadingQuestion[];
}

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: "a1-cafe",
    level: "A1",
    title: { en: "At the café", sv: "På kaféet" },
    text:
      "María entra en un café pequeño en Madrid. Pide un café con leche y un croissant. El camarero es muy simpático. Ella lee el periódico mientras come. Hace sol y la gente pasa por la calle.",
    translation: {
      en: "María enters a small café in Madrid. She orders a coffee with milk and a croissant. The waiter is very nice. She reads the newspaper while eating. It's sunny and people walk by on the street.",
      sv: "María går in på ett litet café i Madrid. Hon beställer kaffe med mjölk och en croissant. Kyparen är mycket trevlig. Hon läser tidningen medan hon äter. Solen skiner och folk går förbi på gatan.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What does María order?", sv: "Vad beställer María?" },
        options: ["A tea", "A coffee with milk", "A juice", "Just a croissant"],
        answer: "A coffee with milk",
      },
      {
        id: "q2",
        prompt: { en: "How is the waiter described?", sv: "Hur beskrivs kyparen?" },
        options: ["Rude", "Nice", "Tired", "Young"],
        answer: "Nice",
      },
      {
        id: "q3",
        prompt: { en: "What's the weather like?", sv: "Hur är vädret?" },
        options: ["Rainy", "Cloudy", "Sunny", "Windy"],
        answer: "Sunny",
      },
    ],
  },
  {
    id: "a2-weekend",
    level: "A2",
    title: { en: "A weekend in Barcelona", sv: "En helg i Barcelona" },
    text:
      "El sábado pasado Juan y Ana viajaron a Barcelona en tren. Visitaron la Sagrada Familia y caminaron por Las Ramblas. Por la tarde comieron paella en un restaurante junto al mar. El domingo fueron a la playa antes de volver a casa.",
    translation: {
      en: "Last Saturday Juan and Ana traveled to Barcelona by train. They visited the Sagrada Familia and walked along Las Ramblas. In the afternoon they ate paella at a restaurant by the sea. On Sunday they went to the beach before going home.",
      sv: "Förra lördagen reste Juan och Ana till Barcelona med tåg. De besökte Sagrada Familia och gick längs Las Ramblas. På eftermiddagen åt de paella på en restaurang vid havet. På söndagen gick de till stranden innan de åkte hem.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "How did they travel?", sv: "Hur reste de?" },
        options: ["By car", "By plane", "By train", "By bus"],
        answer: "By train",
      },
      {
        id: "q2",
        prompt: { en: "What did they eat?", sv: "Vad åt de?" },
        options: ["Tapas", "Paella", "Pizza", "Tortilla"],
        answer: "Paella",
      },
      {
        id: "q3",
        prompt: { en: "Where did they go on Sunday?", sv: "Vart gick de på söndagen?" },
        options: ["The beach", "A museum", "Home", "A football match"],
        answer: "The beach",
      },
    ],
  },
  {
    id: "b1-trabajo",
    level: "B1",
    title: { en: "A new job", sv: "Ett nytt jobb" },
    text:
      "Elena empezó un nuevo trabajo en una empresa de tecnología la semana pasada. Está nerviosa pero también muy emocionada. Sus compañeros son amables y su jefa le ha explicado todo con paciencia. Espera aprender mucho en los próximos meses.",
    translation: {
      en: "Elena started a new job at a tech company last week. She's nervous but also very excited. Her colleagues are kind and her boss has explained everything to her patiently. She hopes to learn a lot in the coming months.",
      sv: "Elena började på ett nytt jobb hos ett tech-företag förra veckan. Hon är nervös men också väldigt uppspelt. Hennes kollegor är vänliga och hennes chef har förklarat allt tålmodigt. Hon hoppas lära sig mycket de kommande månaderna.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What kind of company does Elena work for?", sv: "Vad för slags företag jobbar Elena på?" },
        options: ["Banking", "Technology", "Restaurant", "Healthcare"],
        answer: "Technology",
      },
      {
        id: "q2",
        prompt: { en: "How does she feel?", sv: "Hur känner hon sig?" },
        options: ["Bored", "Nervous and excited", "Angry", "Sad"],
        answer: "Nervous and excited",
      },
    ],
  },
  {
    id: "b2-medio",
    level: "B2",
    title: { en: "Climate awareness", sv: "Klimatmedvetenhet" },
    text:
      "El cambio climático es uno de los mayores retos del siglo XXI. Muchos jóvenes participan en manifestaciones para exigir políticas más sostenibles. Las ciudades fomentan el uso de bicicletas y transporte público para reducir las emisiones de carbono.",
    translation: {
      en: "Climate change is one of the greatest challenges of the 21st century. Many young people take part in demonstrations to demand more sustainable policies. Cities are encouraging cycling and public transport to reduce carbon emissions.",
      sv: "Klimatförändringarna är en av 2000-talets största utmaningar. Många unga deltar i demonstrationer för att kräva mer hållbar politik. Städer uppmuntrar cyklande och kollektivtrafik för att minska koldioxidutsläppen.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What do young people demand?", sv: "Vad kräver de unga?" },
        options: [
          "Lower taxes",
          "More sustainable policies",
          "Free education",
          "Bigger cars",
        ],
        answer: "More sustainable policies",
      },
      {
        id: "q2",
        prompt: { en: "What do cities encourage?", sv: "Vad uppmuntrar städerna?" },
        options: [
          "Cycling and public transport",
          "Driving more",
          "Working from home",
          "Building more roads",
        ],
        answer: "Cycling and public transport",
      },
    ],
  },
];

export interface SeedFlashcard {
  id: string;
  spanish: string;
  translation: { en: string; sv: string };
  level: Level;
  example?: string;
}

// Seed cards used to bootstrap a Flashcards session when the user has no
// saved vocabulary yet. Real saved vocabulary (when present) overrides this.
// TODO(api): replace with /flashcards endpoint that returns due cards.
export const SEED_FLASHCARDS: SeedFlashcard[] = [
  { id: "seed-1", spanish: "hola", translation: { en: "hello", sv: "hej" }, level: "A1" },
  { id: "seed-2", spanish: "gracias", translation: { en: "thank you", sv: "tack" }, level: "A1" },
  { id: "seed-3", spanish: "por favor", translation: { en: "please", sv: "tack/snälla" }, level: "A1" },
  { id: "seed-4", spanish: "amigo", translation: { en: "friend", sv: "vän" }, level: "A1" },
  { id: "seed-5", spanish: "casa", translation: { en: "house", sv: "hus" }, level: "A1" },
  { id: "seed-6", spanish: "libro", translation: { en: "book", sv: "bok" }, level: "A1" },
  { id: "seed-7", spanish: "trabajar", translation: { en: "to work", sv: "att jobba" }, level: "A2" },
  { id: "seed-8", spanish: "viajar", translation: { en: "to travel", sv: "att resa" }, level: "A2" },
];
