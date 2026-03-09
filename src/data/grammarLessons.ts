import { Level } from "@/contexts/AuthContext";

export type ExerciseType = "fill-blank" | "multiple-choice" | "translate" | "error-correction";

export interface GrammarExercise {
  type: ExerciseType;
  question: { sv: string; en: string };
  /** For fill-blank: the sentence with ___ */
  prompt?: string;
  /** Correct answer(s) */
  answer: string;
  /** For multiple-choice */
  options?: string[];
  /** For error-correction: the incorrect sentence */
  incorrectSentence?: string;
  /** Hint shown after wrong attempt */
  hint?: { sv: string; en: string };
}

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
  exercises: GrammarExercise[];
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
        heading: { sv: "Oregelbundna substantiv", en: "Irregular nouns" },
        explanation: {
          sv: "Vissa substantiv följer inte de vanliga reglerna. Viktiga undantag: substantiv som slutar på -ma, -ta, -pa är ofta maskulina trots att de slutar på -a. Några feminina ord kan ha 'el' framför sig när de börjar med betonad a/ha för att undvika upprepning av ljud.",
          en: "Some nouns don't follow the usual patterns. Important exceptions: nouns ending in -ma, -ta, -pa are often masculine despite ending in -a. Some feminine words use 'el' when starting with stressed a/ha to avoid repetition of sounds."
        },
        examples: [
          { es: "el problema", sv: "problemet", en: "the problem" },
          { es: "el tema", sv: "temat", en: "the theme" },
          { es: "el día", sv: "dagen", en: "the day" },
          { es: "el agua (feminine!)", sv: "vattnet", en: "the water" },
          { es: "la mano", sv: "handen", en: "the hand" },
          { es: "la foto", sv: "fotot", en: "the photo" },
        ],
        tip: {
          sv: "Kom ihåg: 'el agua' är femininum! Man säger 'el agua fría' (inte frío).",
          en: "Remember: 'el agua' is feminine! You say 'el agua fría' (not frío)."
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
          { es: "los problemas", sv: "problemen", en: "the problems" },
          { es: "las aguas", sv: "vattnen", en: "the waters" },
        ]
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ libro", answer: "el", hint: { sv: "'Libro' slutar på -o och är maskulint", en: "'Libro' ends in -o and is masculine" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ casa", answer: "la", hint: { sv: "'Casa' slutar på -a och är feminint", en: "'Casa' ends in -a and is feminine" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel passar? ___ mesa", en: "Which article fits? ___ mesa" }, answer: "la", options: ["el", "la", "los", "las"], hint: { sv: "'Mesa' är femininum singular", en: "'Mesa' is feminine singular" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel passar? ___ problema (oregelbundet!)", en: "Which article fits? ___ problema (irregular!)" }, answer: "el", options: ["el", "la", "los", "las"], hint: { sv: "'Problema' slutar på -ma och är maskulint!", en: "'Problema' ends in -ma and is masculine!" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ mano", answer: "la", hint: { sv: "Oregelbundet: 'mano' är femininum trots -o!", en: "Irregular: 'mano' is feminine despite -o!" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ agua", answer: "el", hint: { sv: "Femininum ord på betonad a använder 'el'", en: "Feminine words with stressed a use 'el'" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel? ___ día", en: "Which article? ___ día" }, answer: "el", options: ["el", "la", "los", "las"], hint: { sv: "Oregelbundet: 'día' är maskulint!", en: "Irregular: 'día' is masculine!" } },
      { type: "translate", question: { sv: "Översätt: problemen", en: "Translate: the problems" }, answer: "los problemas", hint: { sv: "'Problema' är maskulint plural", en: "'Problema' is masculine plural" } },
      { type: "error-correction", question: { sv: "Rätta felet i meningen", en: "Correct the error in the sentence" }, incorrectSentence: "La problema es difícil.", answer: "El problema es difícil.", hint: { sv: "'Problema' är maskulint trots -a", en: "'Problema' is masculine despite -a" } },
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
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ perro", answer: "un", hint: { sv: "'Perro' är maskulint singular", en: "'Perro' is masculine singular" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ flor", answer: "una", hint: { sv: "'Flor' är feminint", en: "'Flor' is feminine" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel? ___ libros", en: "Which article? ___ libros" }, answer: "unos", options: ["un", "una", "unos", "unas"], hint: { sv: "Maskulinum plural", en: "Masculine plural" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel? ___ flores", en: "Which article? ___ flores" }, answer: "unas", options: ["un", "una", "unos", "unas"], hint: { sv: "Femininum plural", en: "Feminine plural" } },
      { type: "translate", question: { sv: "Översätt: en hund", en: "Translate: a dog" }, answer: "un perro", hint: { sv: "Maskulinum singular + 'perro'", en: "Masculine singular + 'perro'" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Un flor bonita.", answer: "Una flor bonita.", hint: { sv: "'Flor' är feminint", en: "'Flor' is feminine" } },
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
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Jag ___ svensk. (permanent egenskap)", en: "I ___ Swedish. (permanent trait)" }, answer: "soy", options: ["soy", "estoy", "es", "está"], hint: { sv: "Nationalitet = SER", en: "Nationality = SER" } },
      { type: "multiple-choice", question: { sv: "Jag ___ trött. (tillfälligt tillstånd)", en: "I ___ tired. (temporary state)" }, answer: "estoy", options: ["soy", "estoy", "es", "está"], hint: { sv: "Tillfällig känsla = ESTAR", en: "Temporary feeling = ESTAR" } },
      { type: "fill-blank", question: { sv: "Fyll i ser eller estar", en: "Fill in ser or estar" }, prompt: "Ella ___ profesora.", answer: "es", hint: { sv: "Yrke = SER (tredje person)", en: "Profession = SER (third person)" } },
      { type: "fill-blank", question: { sv: "Fyll i ser eller estar", en: "Fill in ser or estar" }, prompt: "El libro ___ en la mesa.", answer: "está", hint: { sv: "Plats = ESTAR", en: "Location = ESTAR" } },
      { type: "multiple-choice", question: { sv: "Nosotros ___ contentos. (känsla)", en: "We ___ happy. (feeling)" }, answer: "estamos", options: ["somos", "estamos", "son", "están"], hint: { sv: "Känsla/tillstånd = ESTAR", en: "Feeling/state = ESTAR" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Yo estoy sueco.", answer: "Yo soy sueco.", hint: { sv: "Nationalitet kräver SER", en: "Nationality requires SER" } },
      { type: "translate", question: { sv: "Översätt: Hon är lärare.", en: "Translate: She is a teacher." }, answer: "Ella es profesora.", hint: { sv: "Yrke = SER", en: "Profession = SER" } },
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
      },
      {
        heading: { sv: "Oregelbundna verb i presens", en: "Irregular verbs in present tense" },
        explanation: {
          sv: "Några av de vanligaste verben är helt oregelbundna och måste läras in utantill. De viktigaste är: tener (ha), hacer (göra), poner (lägga), salir (gå ut), venir (komma), decir (säga).",
          en: "Some of the most common verbs are completely irregular and must be memorized. The most important are: tener (to have), hacer (to do/make), poner (to put), salir (to leave), venir (to come), decir (to say)."
        },
        examples: [
          { es: "Yo tengo un gato.", sv: "Jag har en katt.", en: "I have a cat." },
          { es: "Tú haces la tarea.", sv: "Du gör läxan.", en: "You do the homework." },
          { es: "Él viene mañana.", sv: "Han kommer imorgon.", en: "He comes tomorrow." },
          { es: "Yo salgo a las ocho.", sv: "Jag går ut klockan åtta.", en: "I leave at eight." },
        ],
        tip: {
          sv: "Första person (yo) är ofta mest oregelbunden: tengo, hago, pongo, salgo, vengo, digo.",
          en: "First person (yo) is often the most irregular: tengo, hago, pongo, salgo, vengo, digo."
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Böj verbet 'hablar' (yo)", en: "Conjugate 'hablar' (yo)" }, prompt: "Yo ___ español.", answer: "hablo", hint: { sv: "-ar verb: yo → -o", en: "-ar verb: yo → -o" } },
      { type: "fill-blank", question: { sv: "Böj verbet 'comer' (ella)", en: "Conjugate 'comer' (ella)" }, prompt: "Ella ___ fruta.", answer: "come", hint: { sv: "-er verb: él/ella → -e", en: "-er verb: él/ella → -e" } },
      { type: "fill-blank", question: { sv: "Böj verbet 'vivir' (nosotros)", en: "Conjugate 'vivir' (nosotros)" }, prompt: "Nosotros ___ en Madrid.", answer: "vivimos", hint: { sv: "-ir verb: nosotros → -imos", en: "-ir verb: nosotros → -imos" } },
      { type: "multiple-choice", question: { sv: "Tú ___ mucho. (hablar)", en: "Tú ___ a lot. (hablar)" }, answer: "hablas", options: ["hablo", "hablas", "habla", "hablamos"], hint: { sv: "-ar verb: tú → -as", en: "-ar verb: tú → -as" } },
      { type: "fill-blank", question: { sv: "Böj oregelbundet verb 'tener' (yo)", en: "Conjugate irregular 'tener' (yo)" }, prompt: "Yo ___ un gato.", answer: "tengo", hint: { sv: "Oregelbundet: tener → tengo", en: "Irregular: tener → tengo" } },
      { type: "fill-blank", question: { sv: "Böj oregelbundet verb 'hacer' (tú)", en: "Conjugate irregular 'hacer' (tú)" }, prompt: "Tú ___ la tarea.", answer: "haces", hint: { sv: "hacer → haces", en: "hacer → haces" } },
      { type: "multiple-choice", question: { sv: "Yo ___ a las ocho. (salir)", en: "I ___ at eight. (salir)" }, answer: "salgo", options: ["salo", "sale", "salgo", "sales"], hint: { sv: "Oregelbundet: salir → salgo", en: "Irregular: salir → salgo" } },
      { type: "multiple-choice", question: { sv: "Él ___ mañana. (venir)", en: "He ___ tomorrow. (venir)" }, answer: "viene", options: ["vene", "viene", "vien", "vengo"], hint: { sv: "venir → viene", en: "venir → viene" } },
      { type: "translate", question: { sv: "Översätt: Jag har en katt.", en: "Translate: I have a cat." }, answer: "Yo tengo un gato.", hint: { sv: "tener → tengo (oregelbundet)", en: "tener → tengo (irregular)" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Yo teno un perro.", answer: "Yo tengo un perro.", hint: { sv: "tener är oregelbundet: tengo", en: "tener is irregular: tengo" } },
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
      },
      {
        heading: { sv: "Oregelbundna adjektiv", en: "Irregular adjectives" },
        explanation: {
          sv: "Vissa adjektiv förkortas när de står FÖRE ett maskulint substantiv: bueno → buen, malo → mal, grande → gran, primero → primer, tercero → tercer. 'Grande' blir 'gran' före BÅDE maskulina och feminina substantiv och betyder då 'fantastisk' istället för 'stor'.",
          en: "Some adjectives shorten when placed BEFORE a masculine noun: bueno → buen, malo → mal, grande → gran, primero → primer, tercero → tercer. 'Grande' becomes 'gran' before BOTH masculine and feminine nouns and then means 'great' instead of 'big'."
        },
        examples: [
          { es: "Un buen amigo. (Un amigo bueno = också ok)", sv: "En bra vän.", en: "A good friend." },
          { es: "Un mal día.", sv: "En dålig dag.", en: "A bad day." },
          { es: "Un gran hombre. / Una gran mujer.", sv: "En fantastisk man. / En fantastisk kvinna.", en: "A great man. / A great woman." },
          { es: "El primer día. / La primera semana.", sv: "Den första dagen. / Den första veckan.", en: "The first day. / The first week." },
        ],
        tip: {
          sv: "Efter substantivet används hela formen: 'un amigo bueno', 'un hombre grande'.",
          en: "After the noun, use the full form: 'un amigo bueno', 'un hombre grande'."
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Skriv rätt form av 'alto' (femininum)", en: "Write correct form of 'alto' (feminine)" }, prompt: "La chica es ___.", answer: "alta", hint: { sv: "-o → -a i femininum", en: "-o → -a in feminine" } },
      { type: "fill-blank", question: { sv: "Skriv rätt pluralform av 'alto' (maskulinum)", en: "Write correct plural of 'alto' (masculine)" }, prompt: "Los chicos son ___.", answer: "altos", hint: { sv: "Plural: lägg till -s", en: "Plural: add -s" } },
      { type: "multiple-choice", question: { sv: "Las casas son ___. (grande)", en: "The houses are ___. (grande)" }, answer: "grandes", options: ["grande", "grandes", "grando", "grandos"], hint: { sv: "'Grande' slutar på -e, plural = -es", en: "'Grande' ends in -e, plural = -es" } },
      { type: "fill-blank", question: { sv: "Förkorta 'bueno' före maskulint substantiv", en: "Shorten 'bueno' before masculine noun" }, prompt: "Un ___ amigo.", answer: "buen", hint: { sv: "Före maskulint substantiv: bueno → buen", en: "Before masculine noun: bueno → buen" } },
      { type: "fill-blank", question: { sv: "Förkorta 'grande' före substantiv", en: "Shorten 'grande' before noun" }, prompt: "Un ___ hombre.", answer: "gran", hint: { sv: "Grande → gran före substantiv", en: "Grande → gran before noun" } },
      { type: "multiple-choice", question: { sv: "El ___ día. (primero)", en: "The ___ day. (primero)" }, answer: "primer", options: ["primero", "primer", "primera", "primeres"], hint: { sv: "Primero → primer före maskulint", en: "Primero → primer before masculine" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Un malo día.", answer: "Un mal día.", hint: { sv: "Malo → mal före maskulint substantiv", en: "Malo → mal before masculine noun" } },
      { type: "translate", question: { sv: "Översätt: En fantastisk kvinna.", en: "Translate: A great woman." }, answer: "Una gran mujer.", hint: { sv: "Grande → gran före substantiv (fantastisk)", en: "Grande → gran before noun (great)" } },
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
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Böj 'hablar' i preteritum (yo)", en: "Conjugate 'hablar' in preterite (yo)" }, prompt: "Yo ___ con María ayer.", answer: "hablé", hint: { sv: "-ar verb: yo → -é", en: "-ar verb: yo → -é" } },
      { type: "fill-blank", question: { sv: "Böj 'comer' i preteritum (yo)", en: "Conjugate 'comer' in preterite (yo)" }, prompt: "Yo ___ paella en Valencia.", answer: "comí", hint: { sv: "-er verb: yo → -í", en: "-er verb: yo → -í" } },
      { type: "multiple-choice", question: { sv: "Ella ___ un vestido. (comprar)", en: "She ___ a dress. (comprar)" }, answer: "compró", options: ["compré", "compraste", "compró", "compraron"], hint: { sv: "Ella → tredje person singular", en: "Ella → third person singular" } },
      { type: "multiple-choice", question: { sv: "Ellos ___ en Madrid. (vivir)", en: "They ___ in Madrid. (vivir)" }, answer: "vivieron", options: ["viví", "viviste", "vivió", "vivieron"], hint: { sv: "Ellos → tredje person plural", en: "Ellos → third person plural" } },
      { type: "translate", question: { sv: "Översätt: Jag pratade med María igår.", en: "Translate: I spoke with María yesterday." }, answer: "Yo hablé con María ayer.", hint: { sv: "hablar → hablé (yo, preteritum)", en: "hablar → hablé (yo, preterite)" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Yo hablo con María ayer.", answer: "Yo hablé con María ayer.", hint: { sv: "'Ayer' kräver preteritum", en: "'Ayer' requires preterite" } },
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
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i rätt reflexivt pronomen", en: "Fill in the correct reflexive pronoun" }, prompt: "___ levanto a las siete.", answer: "Me", hint: { sv: "Yo → me", en: "Yo → me" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt reflexivt pronomen", en: "Fill in the correct reflexive pronoun" }, prompt: "Ella ___ ducha por la mañana.", answer: "se", hint: { sv: "Ella → se", en: "Ella → se" } },
      { type: "multiple-choice", question: { sv: "___ acostamos tarde. (nosotros)", en: "___ go to bed late. (nosotros)" }, answer: "Nos", options: ["Me", "Te", "Nos", "Se"], hint: { sv: "Nosotros → nos", en: "Nosotros → nos" } },
      { type: "multiple-choice", question: { sv: "Tú ___ despiertas temprano. (pronomen?)", en: "You ___ wake up early. (pronoun?)" }, answer: "te", options: ["me", "te", "se", "nos"], hint: { sv: "Tú → te", en: "Tú → te" } },
      { type: "translate", question: { sv: "Översätt: Jag går upp klockan sju.", en: "Translate: I get up at seven." }, answer: "Me levanto a las siete.", hint: { sv: "levantarse → me levanto", en: "levantarse → me levanto" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Ella levanta por la mañana.", answer: "Ella se levanta por la mañana.", hint: { sv: "Reflexivt pronomen saknas: se", en: "Reflexive pronoun missing: se" } },
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
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: María es ___ alta que Pedro.", en: "Fill in: María is ___ tall than Pedro." }, prompt: "María es ___ alta que Pedro.", answer: "más", hint: { sv: "Mer = más", en: "More = más" } },
      { type: "multiple-choice", question: { sv: "Es ___ restaurante. (bäst)", en: "It's ___ restaurant. (best)" }, answer: "el mejor", options: ["el más bueno", "el mejor", "el más mejor", "el bueno"], hint: { sv: "'Bueno' har oregelbunden superlativ: mejor", en: "'Bueno' has irregular superlative: mejor" } },
      { type: "fill-blank", question: { sv: "Este libro es ___ interesante que el otro. (mindre)", en: "This book is ___ interesting than the other. (less)" }, prompt: "Este libro es ___ interesante que el otro.", answer: "menos", hint: { sv: "Mindre = menos", en: "Less = menos" } },
      { type: "translate", question: { sv: "Översätt: Det är den vackraste staden.", en: "Translate: It's the most beautiful city." }, answer: "Es la ciudad más bonita.", hint: { sv: "la + más + adjektiv", en: "la + más + adjective" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "María es más alta de Pedro.", answer: "María es más alta que Pedro.", hint: { sv: "Jämförelse: más...que (inte de)", en: "Comparison: más...que (not de)" } },
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
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Cuando era niño, ___ en el parque. (vana)", en: "When I was a child, I ___ in the park. (habit)" }, answer: "jugaba", options: ["jugué", "jugaba", "jugo", "jugará"], hint: { sv: "Vana i förflutna = imperfekt", en: "Past habit = imperfect" } },
      { type: "multiple-choice", question: { sv: "Dormía cuando ___ el teléfono. (avbrott)", en: "I was sleeping when the phone ___. (interruption)" }, answer: "sonó", options: ["sonaba", "sonó", "suena", "sonará"], hint: { sv: "Avbrott i pågående handling = preteritum", en: "Interruption of ongoing action = preterite" } },
      { type: "fill-blank", question: { sv: "Fyll i imperfekt av 'llover'", en: "Fill in imperfect of 'llover'" }, prompt: "___ mucho ese día.", answer: "Llovía", hint: { sv: "Bakgrundsbeskrivning = imperfekt", en: "Background description = imperfect" } },
      { type: "fill-blank", question: { sv: "Fyll i preteritum av 'ver' (yo)", en: "Fill in preterite of 'ver' (yo)" }, prompt: "Caminaba cuando ___ a Juan.", answer: "vi", hint: { sv: "Specifik händelse = preteritum. Ver → vi (yo)", en: "Specific event = preterite. Ver → vi (yo)" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Cuando fui niño, jugaba en el parque.", answer: "Cuando era niño, jugaba en el parque.", hint: { sv: "'Vara barn' är en bakgrund/tillstånd = imperfekt", en: "'Being a child' is background/state = imperfect" } },
      { type: "translate", question: { sv: "Översätt: Jag sov när telefonen ringde.", en: "Translate: I was sleeping when the phone rang." }, answer: "Dormía cuando sonó el teléfono.", hint: { sv: "Bakgrund (imperfekt) + händelse (preteritum)", en: "Background (imperfect) + event (preterite)" } },
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
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Quiero que ___ a mi fiesta. (venir, tú)", en: "I want you to ___ to my party. (venir, tú)" }, answer: "vengas", options: ["vienes", "vengas", "vendrás", "viniste"], hint: { sv: "Önskning + que = konjunktiv", en: "Wish + que = subjunctive" } },
      { type: "multiple-choice", question: { sv: "Espero que ___ bien. (estar, tú)", en: "I hope you ___ well. (estar, tú)" }, answer: "estés", options: ["estás", "estés", "estarás", "estabas"], hint: { sv: "Hopp = WEIRDO → konjunktiv", en: "Hope = WEIRDO → subjunctive" } },
      { type: "fill-blank", question: { sv: "Fyll i konjunktiv av 'ser' (det)", en: "Fill in subjunctive of 'ser' (it)" }, prompt: "No creo que ___ verdad.", answer: "sea", hint: { sv: "Tvivel + que = konjunktiv. Ser → sea", en: "Doubt + que = subjunctive. Ser → sea" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Quiero que vienes a mi fiesta.", answer: "Quiero que vengas a mi fiesta.", hint: { sv: "Efter 'quiero que' måste det vara konjunktiv", en: "After 'quiero que' it must be subjunctive" } },
      { type: "translate", question: { sv: "Översätt: Jag hoppas att du mår bra.", en: "Translate: I hope you're well." }, answer: "Espero que estés bien.", hint: { sv: "Esperar + que + konjunktiv", en: "Esperar + que + subjunctive" } },
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
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Estudio ___ aprender. (syfte)", en: "I study ___ learn. (purpose)" }, answer: "para", options: ["por", "para", "de", "a"], hint: { sv: "Syfte = para", en: "Purpose = para" } },
      { type: "multiple-choice", question: { sv: "Gracias ___ tu ayuda. (orsak)", en: "Thanks ___ your help. (cause)" }, answer: "por", options: ["por", "para", "de", "con"], hint: { sv: "Orsak/anledning = por", en: "Cause/reason = por" } },
      { type: "fill-blank", question: { sv: "Fyll i por eller para", en: "Fill in por or para" }, prompt: "Este regalo es ___ ti.", answer: "para", hint: { sv: "Mottagare = para", en: "Recipient = para" } },
      { type: "fill-blank", question: { sv: "Fyll i por eller para", en: "Fill in por or para" }, prompt: "Caminé ___ el parque.", answer: "por", hint: { sv: "Rörelse genom = por", en: "Movement through = por" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Gracias para tu ayuda.", answer: "Gracias por tu ayuda.", hint: { sv: "Tacksamhet/orsak = por", en: "Gratitude/cause = por" } },
      { type: "translate", question: { sv: "Översätt: Den här presenten är till dig.", en: "Translate: This gift is for you." }, answer: "Este regalo es para ti.", hint: { sv: "Mottagare = para", en: "Recipient = para" } },
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
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Cuando ___, llámame. (llegar, tú – framtid)", en: "When you ___, call me. (llegar, tú – future)" }, answer: "llegues", options: ["llegas", "llegues", "llegarás", "llegaste"], hint: { sv: "Cuando + framtid = konjunktiv", en: "Cuando + future = subjunctive" } },
      { type: "multiple-choice", question: { sv: "Si ___ dinero, viajaría. (tener, yo)", en: "If I ___ money, I would travel. (tener, yo)" }, answer: "tuviera", options: ["tengo", "tenía", "tuviera", "tendré"], hint: { sv: "Si + hypotetisk = konjunktiv imperfekt", en: "Si + hypothetical = imperfect subjunctive" } },
      { type: "fill-blank", question: { sv: "Fyll i konjunktiv av 'llover'", en: "Fill in subjunctive of 'llover'" }, prompt: "Aunque ___, iremos.", answer: "llueva", hint: { sv: "Aunque + osäkerhet = konjunktiv", en: "Aunque + uncertainty = subjunctive" } },
      { type: "fill-blank", question: { sv: "Fyll i konjunktiv imperfekt av 'venir' (tú)", en: "Fill in imperfect subjunctive of 'venir' (tú)" }, prompt: "Quería que ___.", answer: "vinieras", hint: { sv: "Vinieron → vinier- + -as", en: "Vinieron → vinier- + -as" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Cuando llegas, llámame.", answer: "Cuando llegues, llámame.", hint: { sv: "Cuando + framtid kräver konjunktiv", en: "Cuando + future requires subjunctive" } },
      { type: "translate", question: { sv: "Översätt: Om jag hade pengar, skulle jag resa.", en: "Translate: If I had money, I would travel." }, answer: "Si tuviera dinero, viajaría.", hint: { sv: "Si + konjunktiv imperfekt + konditionalis", en: "Si + imperfect subjunctive + conditional" } },
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
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Si estudias, ___. (Typ 1)", en: "If you study, ___. (Type 1)" }, answer: "aprobarás", options: ["apruebas", "aprobarás", "aprobarías", "habrías aprobado"], hint: { sv: "Typ 1: Si + presens → futurum", en: "Type 1: Si + present → future" } },
      { type: "multiple-choice", question: { sv: "Si fuera rico, ___ una isla. (Typ 2)", en: "If I were rich, I ___ an island. (Type 2)" }, answer: "compraría", options: ["compro", "compraré", "compraría", "habría comprado"], hint: { sv: "Typ 2: Si + konj. imperf. → konditionalis", en: "Type 2: Si + imp. subj. → conditional" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt verbform (Typ 3)", en: "Fill in correct verb form (Type 3)" }, prompt: "Si hubiera estudiado, ___ aprobado.", answer: "habría", hint: { sv: "Typ 3: konditionalis perfekt = habría + particip", en: "Type 3: conditional perfect = habría + past participle" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Si estudias, aprobarías.", answer: "Si estudias, aprobarás.", hint: { sv: "Si + presens → futurum (inte konditionalis)", en: "Si + present → future (not conditional)" } },
      { type: "translate", question: { sv: "Översätt: Om jag vore rik, skulle jag köpa en ö.", en: "Translate: If I were rich, I would buy an island." }, answer: "Si fuera rico, compraría una isla.", hint: { sv: "Si + konjunktiv imperfekt + konditionalis", en: "Si + imperfect subjunctive + conditional" } },
    ]
  },
];
