import { Level } from "@/contexts/AuthContext";

export interface GrammarLesson {
  id: string;
  title: { sv: string; en: string };
  level: Level;
  category: string;
  sections: {
    heading: { sv: string; en: string };
    explanation: { sv: string; en: string };
    examples: { es: string; sv: string; en: string }[];
    tip?: { sv: string; en: string };
  }[];
}

export const grammarLessons: GrammarLesson[] = [
  // A1
  {
    id: "articles-definite",
    title: { sv: "Bestämda artiklar (el, la, los, las)", en: "Definite articles (el, la, los, las)" },
    level: "A1",
    category: "articles",
    sections: [
      {
        heading: { sv: "Maskulinum och femininum", en: "Masculine and feminine" },
        explanation: {
          sv: "Alla spanska substantiv har ett genus – maskulinum eller femininum. Bestämda artikeln för maskulinum singular är 'el' och för femininum singular 'la'.",
          en: "All Spanish nouns have a gender – masculine or feminine. The definite article for masculine singular is 'el' and for feminine singular 'la'."
        },
        examples: [
          { es: "el libro", sv: "boken", en: "the book" },
          { es: "la casa", sv: "huset", en: "the house" },
          { es: "el gato", sv: "katten", en: "the cat" },
          { es: "la mesa", sv: "bordet", en: "the table" },
        ],
        tip: {
          sv: "Substantiv som slutar på -o är oftast maskulina, och de som slutar på -a är oftast feminina.",
          en: "Nouns ending in -o are usually masculine, and those ending in -a are usually feminine."
        }
      },
      {
        heading: { sv: "Pluralformer", en: "Plural forms" },
        explanation: {
          sv: "I plural blir 'el' till 'los' och 'la' till 'las'. Substantivet får också en ändelse: -s om det slutar på vokal, -es om det slutar på konsonant.",
          en: "In plural, 'el' becomes 'los' and 'la' becomes 'las'. The noun also gets a suffix: -s if it ends in a vowel, -es if it ends in a consonant."
        },
        examples: [
          { es: "los libros", sv: "böckerna", en: "the books" },
          { es: "las casas", sv: "husen", en: "the houses" },
        ]
      }
    ]
  },
  {
    id: "articles-indefinite",
    title: { sv: "Obestämda artiklar (un, una, unos, unas)", en: "Indefinite articles (un, una, unos, unas)" },
    level: "A1",
    category: "articles",
    sections: [
      {
        heading: { sv: "Singular", en: "Singular" },
        explanation: {
          sv: "'Un' används för maskulina substantiv och 'una' för feminina. De motsvarar svenskans 'en/ett'.",
          en: "'Un' is used for masculine nouns and 'una' for feminine. They correspond to English 'a/an'."
        },
        examples: [
          { es: "un perro", sv: "en hund", en: "a dog" },
          { es: "una flor", sv: "en blomma", en: "a flower" },
        ]
      },
      {
        heading: { sv: "Plural", en: "Plural" },
        explanation: {
          sv: "'Unos' och 'unas' betyder 'några' eller 'ett par'.",
          en: "'Unos' and 'unas' mean 'some' or 'a few'."
        },
        examples: [
          { es: "unos libros", sv: "några böcker", en: "some books" },
          { es: "unas flores", sv: "några blommor", en: "some flowers" },
        ]
      }
    ]
  },
  {
    id: "ser-estar",
    title: { sv: "Ser vs Estar – att vara", en: "Ser vs Estar – to be" },
    level: "A1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Ser – permanenta egenskaper", en: "Ser – permanent characteristics" },
        explanation: {
          sv: "'Ser' används för permanenta egenskaper: nationalitet, yrke, utseende, personlighet och tid.",
          en: "'Ser' is used for permanent characteristics: nationality, profession, appearance, personality, and time."
        },
        examples: [
          { es: "Soy sueco.", sv: "Jag är svensk.", en: "I am Swedish." },
          { es: "Ella es profesora.", sv: "Hon är lärare.", en: "She is a teacher." },
          { es: "Son las tres.", sv: "Klockan är tre.", en: "It's three o'clock." },
        ]
      },
      {
        heading: { sv: "Estar – tillfälliga tillstånd och plats", en: "Estar – temporary states and location" },
        explanation: {
          sv: "'Estar' används för tillfälliga tillstånd, känslor, plats och resultat av handlingar.",
          en: "'Estar' is used for temporary states, feelings, location, and results of actions."
        },
        examples: [
          { es: "Estoy cansado.", sv: "Jag är trött.", en: "I am tired." },
          { es: "El libro está en la mesa.", sv: "Boken är på bordet.", en: "The book is on the table." },
          { es: "Estamos contentos.", sv: "Vi är glada.", en: "We are happy." },
        ],
        tip: {
          sv: "Tänk: SER = vad något ÄR, ESTAR = hur något MÅR eller VAR det befinner sig.",
          en: "Think: SER = what something IS, ESTAR = how something FEELS or WHERE it is."
        }
      }
    ]
  },
  {
    id: "present-tense-regular",
    title: { sv: "Presens – regelbundna verb (-ar, -er, -ir)", en: "Present tense – regular verbs (-ar, -er, -ir)" },
    level: "A1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "-ar verb (t.ex. hablar)", en: "-ar verbs (e.g. hablar)" },
        explanation: {
          sv: "Ta bort -ar och lägg till: -o, -as, -a, -amos, -áis, -an",
          en: "Remove -ar and add: -o, -as, -a, -amos, -áis, -an"
        },
        examples: [
          { es: "Yo hablo español.", sv: "Jag talar spanska.", en: "I speak Spanish." },
          { es: "Tú hablas mucho.", sv: "Du pratar mycket.", en: "You talk a lot." },
          { es: "Nosotros hablamos en clase.", sv: "Vi pratar på lektionen.", en: "We talk in class." },
        ]
      },
      {
        heading: { sv: "-er verb (t.ex. comer)", en: "-er verbs (e.g. comer)" },
        explanation: {
          sv: "Ta bort -er och lägg till: -o, -es, -e, -emos, -éis, -en",
          en: "Remove -er and add: -o, -es, -e, -emos, -éis, -en"
        },
        examples: [
          { es: "Yo como pizza.", sv: "Jag äter pizza.", en: "I eat pizza." },
          { es: "Ella come fruta.", sv: "Hon äter frukt.", en: "She eats fruit." },
        ]
      },
      {
        heading: { sv: "-ir verb (t.ex. vivir)", en: "-ir verbs (e.g. vivir)" },
        explanation: {
          sv: "Ta bort -ir och lägg till: -o, -es, -e, -imos, -ís, -en",
          en: "Remove -ir and add: -o, -es, -e, -imos, -ís, -en"
        },
        examples: [
          { es: "Yo vivo en Suecia.", sv: "Jag bor i Sverige.", en: "I live in Sweden." },
          { es: "Ellos viven aquí.", sv: "De bor här.", en: "They live here." },
        ]
      }
    ]
  },
  {
    id: "adjective-agreement",
    title: { sv: "Adjektivkongruens – genus och numerus", en: "Adjective agreement – gender and number" },
    level: "A1",
    category: "adjectives",
    sections: [
      {
        heading: { sv: "Genus", en: "Gender" },
        explanation: {
          sv: "Adjektiv som slutar på -o ändras till -a i femininum. Adjektiv som slutar på -e eller konsonant ändras inte.",
          en: "Adjectives ending in -o change to -a in feminine. Adjectives ending in -e or a consonant don't change."
        },
        examples: [
          { es: "El chico es alto. La chica es alta.", sv: "Pojken är lång. Flickan är lång.", en: "The boy is tall. The girl is tall." },
          { es: "El hombre es inteligente. La mujer es inteligente.", sv: "Mannen är intelligent. Kvinnan är intelligent.", en: "The man is intelligent. The woman is intelligent." },
        ]
      },
      {
        heading: { sv: "Numerus", en: "Number" },
        explanation: {
          sv: "I plural läggs -s till om adjektivet slutar på vokal, -es om det slutar på konsonant.",
          en: "In plural, add -s if the adjective ends in a vowel, -es if it ends in a consonant."
        },
        examples: [
          { es: "Los chicos son altos.", sv: "Pojkarna är långa.", en: "The boys are tall." },
          { es: "Las casas son grandes.", sv: "Husen är stora.", en: "The houses are big." },
        ],
        tip: {
          sv: "Adjektivet kommer oftast EFTER substantivet på spanska, till skillnad från svenskan.",
          en: "The adjective usually comes AFTER the noun in Spanish, unlike in English/Swedish."
        }
      }
    ]
  },
  // A2
  {
    id: "preterite-regular",
    title: { sv: "Preteritum – regelbundna verb", en: "Preterite – regular verbs" },
    level: "A2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "-ar verb i preteritum", en: "-ar verbs in preterite" },
        explanation: {
          sv: "Ta bort -ar och lägg till: -é, -aste, -ó, -amos, -asteis, -aron. Preteritum uttrycker avslutade handlingar i det förflutna.",
          en: "Remove -ar and add: -é, -aste, -ó, -amos, -asteis, -aron. The preterite expresses completed past actions."
        },
        examples: [
          { es: "Yo hablé con María ayer.", sv: "Jag pratade med María igår.", en: "I spoke with María yesterday." },
          { es: "Ella compró un vestido.", sv: "Hon köpte en klänning.", en: "She bought a dress." },
        ]
      },
      {
        heading: { sv: "-er/-ir verb i preteritum", en: "-er/-ir verbs in preterite" },
        explanation: {
          sv: "Samma ändelser för -er och -ir: -í, -iste, -ió, -imos, -isteis, -ieron",
          en: "Same endings for -er and -ir: -í, -iste, -ió, -imos, -isteis, -ieron"
        },
        examples: [
          { es: "Comí paella en Valencia.", sv: "Jag åt paella i Valencia.", en: "I ate paella in Valencia." },
          { es: "Vivieron en Madrid.", sv: "De bodde i Madrid.", en: "They lived in Madrid." },
        ]
      }
    ]
  },
  {
    id: "reflexive-verbs",
    title: { sv: "Reflexiva verb (levantarse, ducharse...)", en: "Reflexive verbs (levantarse, ducharse...)" },
    level: "A2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Hur reflexiva verb fungerar", en: "How reflexive verbs work" },
        explanation: {
          sv: "Reflexiva verb har ett pronomen (me, te, se, nos, os, se) som visar att handlingen utförs på sig själv. Pronomenet placeras före det böjda verbet.",
          en: "Reflexive verbs have a pronoun (me, te, se, nos, os, se) showing the action is performed on oneself. The pronoun is placed before the conjugated verb."
        },
        examples: [
          { es: "Me levanto a las siete.", sv: "Jag går upp klockan sju.", en: "I get up at seven." },
          { es: "Ella se ducha por la mañana.", sv: "Hon duschar på morgonen.", en: "She showers in the morning." },
          { es: "Nos acostamos tarde.", sv: "Vi lägger oss sent.", en: "We go to bed late." },
        ],
        tip: {
          sv: "Många dagliga rutiner uttrycks med reflexiva verb på spanska.",
          en: "Many daily routines are expressed with reflexive verbs in Spanish."
        }
      }
    ]
  },
  {
    id: "comparatives",
    title: { sv: "Komparativ och superlativ", en: "Comparatives and superlatives" },
    level: "A2",
    category: "adjectives",
    sections: [
      {
        heading: { sv: "Komparativ (más...que, menos...que)", en: "Comparative (más...que, menos...que)" },
        explanation: {
          sv: "För att jämföra använder man 'más + adjektiv + que' (mer...än) eller 'menos + adjektiv + que' (mindre...än).",
          en: "To compare, use 'más + adjective + que' (more...than) or 'menos + adjective + que' (less...than)."
        },
        examples: [
          { es: "María es más alta que Pedro.", sv: "María är längre än Pedro.", en: "María is taller than Pedro." },
          { es: "Este libro es menos interesante que el otro.", sv: "Den här boken är mindre intressant än den andra.", en: "This book is less interesting than the other." },
        ]
      },
      {
        heading: { sv: "Superlativ", en: "Superlative" },
        explanation: {
          sv: "Superlativ bildas med 'el/la más + adjektiv' eller oregelbundna former som 'mejor' (bäst) och 'peor' (sämst).",
          en: "Superlative is formed with 'el/la más + adjective' or irregular forms like 'mejor' (best) and 'peor' (worst)."
        },
        examples: [
          { es: "Es la ciudad más bonita de España.", sv: "Det är den vackraste staden i Spanien.", en: "It's the most beautiful city in Spain." },
          { es: "Es el mejor restaurante.", sv: "Det är den bästa restaurangen.", en: "It's the best restaurant." },
        ]
      }
    ]
  },
  // B1
  {
    id: "imperfect-vs-preterite",
    title: { sv: "Imperfekt vs Preteritum", en: "Imperfect vs Preterite" },
    level: "B1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "När man använder imperfekt", en: "When to use the imperfect" },
        explanation: {
          sv: "Imperfekt används för pågående/upprepade handlingar i det förflutna, beskrivningar, vanor och bakgrundsinformation.",
          en: "The imperfect is used for ongoing/repeated past actions, descriptions, habits, and background information."
        },
        examples: [
          { es: "Cuando era niño, jugaba en el parque.", sv: "När jag var liten lekte jag i parken.", en: "When I was a child, I played in the park." },
          { es: "Llovía mucho ese día.", sv: "Det regnade mycket den dagen.", en: "It rained a lot that day." },
        ]
      },
      {
        heading: { sv: "Imperfekt + Preteritum tillsammans", en: "Imperfect + Preterite together" },
        explanation: {
          sv: "Ofta används imperfekt för bakgrunden och preteritum för den händelse som avbryter.",
          en: "Often the imperfect sets the background and the preterite interrupts with a completed action."
        },
        examples: [
          { es: "Dormía cuando sonó el teléfono.", sv: "Jag sov när telefonen ringde.", en: "I was sleeping when the phone rang." },
          { es: "Caminaba por la calle cuando vi a Juan.", sv: "Jag gick på gatan när jag såg Juan.", en: "I was walking down the street when I saw Juan." },
        ],
        tip: {
          sv: "Tänk: Imperfekt = filmens bakgrund (kameran panorerar), Preteritum = en specifik händelse (klipp!)",
          en: "Think: Imperfect = movie background (camera panning), Preterite = specific event (cut!)"
        }
      }
    ]
  },
  {
    id: "subjunctive-intro",
    title: { sv: "Introduktion till konjunktiv", en: "Introduction to the subjunctive" },
    level: "B1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Vad är konjunktiv?", en: "What is the subjunctive?" },
        explanation: {
          sv: "Konjunktiv (subjuntivo) används för att uttrycka önskningar, tvivel, känslor och osäkerhet. Den utlöses ofta av 'que' efter vissa verb och uttryck.",
          en: "The subjunctive (subjuntivo) expresses wishes, doubt, emotions, and uncertainty. It's often triggered by 'que' after certain verbs and expressions."
        },
        examples: [
          { es: "Quiero que vengas a mi fiesta.", sv: "Jag vill att du kommer på min fest.", en: "I want you to come to my party." },
          { es: "Espero que estés bien.", sv: "Jag hoppas att du mår bra.", en: "I hope you're well." },
          { es: "No creo que sea verdad.", sv: "Jag tror inte att det är sant.", en: "I don't think it's true." },
        ],
        tip: {
          sv: "WEIRDO-regeln: Wishes, Emotions, Impersonal expressions, Recommendations, Doubt, Ojalá – alla kräver konjunktiv!",
          en: "The WEIRDO rule: Wishes, Emotions, Impersonal expressions, Recommendations, Doubt, Ojalá – all require subjunctive!"
        }
      }
    ]
  },
  {
    id: "por-vs-para",
    title: { sv: "Por vs Para", en: "Por vs Para" },
    level: "B1",
    category: "prepositions",
    sections: [
      {
        heading: { sv: "Para – syfte, destination, mottagare", en: "Para – purpose, destination, recipient" },
        explanation: {
          sv: "'Para' används för syfte (för att), destination, mottagare och deadlines.",
          en: "'Para' is used for purpose (in order to), destination, recipient, and deadlines."
        },
        examples: [
          { es: "Estudio para aprender.", sv: "Jag pluggar för att lära mig.", en: "I study in order to learn." },
          { es: "Este regalo es para ti.", sv: "Den här presenten är till dig.", en: "This gift is for you." },
        ]
      },
      {
        heading: { sv: "Por – orsak, utbyte, rörelse genom", en: "Por – cause, exchange, movement through" },
        explanation: {
          sv: "'Por' används för orsak (på grund av), utbyte, rörelse genom en plats och tidsperioder.",
          en: "'Por' is used for cause (because of), exchange, movement through a place, and time periods."
        },
        examples: [
          { es: "Gracias por tu ayuda.", sv: "Tack för din hjälp.", en: "Thanks for your help." },
          { es: "Caminé por el parque.", sv: "Jag gick genom parken.", en: "I walked through the park." },
          { es: "Pagué diez euros por el libro.", sv: "Jag betalade tio euro för boken.", en: "I paid ten euros for the book." },
        ]
      }
    ]
  },
  // B2
  {
    id: "subjunctive-advanced",
    title: { sv: "Konjunktiv – avancerade användningar", en: "Subjunctive – advanced uses" },
    level: "B2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Konjunktiv i bisatser", en: "Subjunctive in subordinate clauses" },
        explanation: {
          sv: "Konjunktiv används efter konjunktioner som 'cuando' (när, om framtid), 'aunque' (även om), 'para que' (för att), 'antes de que' (innan).",
          en: "The subjunctive is used after conjunctions like 'cuando' (when, if future), 'aunque' (even though), 'para que' (so that), 'antes de que' (before)."
        },
        examples: [
          { es: "Cuando llegues, llámame.", sv: "När du kommer, ring mig.", en: "When you arrive, call me." },
          { es: "Aunque llueva, iremos.", sv: "Även om det regnar, åker vi.", en: "Even if it rains, we'll go." },
        ]
      },
      {
        heading: { sv: "Konjunktiv imperfekt", en: "Imperfect subjunctive" },
        explanation: {
          sv: "Konjunktiv imperfekt bildas från preteritum tredje person plural. Ändelsen -ron byts mot -ra, -ras, -ra, -ramos, -rais, -ran.",
          en: "The imperfect subjunctive is formed from the preterite third person plural. The ending -ron changes to -ra, -ras, -ra, -ramos, -rais, -ran."
        },
        examples: [
          { es: "Si tuviera dinero, viajaría.", sv: "Om jag hade pengar, skulle jag resa.", en: "If I had money, I would travel." },
          { es: "Quería que vinieras.", sv: "Jag ville att du skulle komma.", en: "I wanted you to come." },
        ]
      }
    ]
  },
  {
    id: "conditional-sentences",
    title: { sv: "Villkorssatser (si-satser)", en: "Conditional sentences (si-clauses)" },
    level: "B2",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Typ 1: Reell möjlighet", en: "Type 1: Real possibility" },
        explanation: {
          sv: "Si + presens → futurum. Beskriver verkliga, möjliga scenarier.",
          en: "Si + present → future. Describes real, possible scenarios."
        },
        examples: [
          { es: "Si estudias, aprobarás.", sv: "Om du pluggar, kommer du att klara det.", en: "If you study, you'll pass." },
        ]
      },
      {
        heading: { sv: "Typ 2: Hypotetisk", en: "Type 2: Hypothetical" },
        explanation: {
          sv: "Si + konjunktiv imperfekt → konditionalis. Beskriver osannolika eller hypotetiska scenarier.",
          en: "Si + imperfect subjunctive → conditional. Describes unlikely or hypothetical scenarios."
        },
        examples: [
          { es: "Si fuera rico, compraría una isla.", sv: "Om jag vore rik, skulle jag köpa en ö.", en: "If I were rich, I would buy an island." },
        ]
      },
      {
        heading: { sv: "Typ 3: Omöjlig (förflutet)", en: "Type 3: Impossible (past)" },
        explanation: {
          sv: "Si + konjunktiv pluskvamperfekt → konditionalis perfekt. Beskriver saker som inte hände.",
          en: "Si + pluperfect subjunctive → conditional perfect. Describes things that didn't happen."
        },
        examples: [
          { es: "Si hubiera estudiado, habría aprobado.", sv: "Om jag hade pluggat, hade jag klarat det.", en: "If I had studied, I would have passed." },
        ]
      }
    ]
  },
];
