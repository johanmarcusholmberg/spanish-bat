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
  // ═══════════════════════════════════════════
  // A1 – BEGINNER
  // ═══════════════════════════════════════════

  // 1. Personal pronouns (foundational – early in path)
  {
    id: "personal-pronouns",
    title: { sv: "Personliga pronomen", en: "Personal pronouns" },
    level: "A1",
    category: "pronouns",
    sections: [
      {
        heading: { sv: "Subjektspronomen", en: "Subject pronouns" },
        explanation: {
          sv: "Spanska har följande subjektspronomen: yo (jag), tú (du), él (han), ella (hon), usted (ni/du formellt), nosotros/nosotras (vi), vosotros/vosotras (ni), ellos/ellas (de), ustedes (ni formellt). På spanska utelämnas ofta pronomenet eftersom verbändelsen visar vem som gör handlingen.",
          en: "Spanish has these subject pronouns: yo (I), tú (you informal), él (he), ella (she), usted (you formal), nosotros/nosotras (we), vosotros/vosotras (you all), ellos/ellas (they), ustedes (you all formal). In Spanish, the pronoun is often dropped because the verb ending shows who is acting."
        },
        examples: [
          { es: "Yo hablo español.", sv: "Jag talar spanska.", en: "I speak Spanish." },
          { es: "Tú eres mi amigo.", sv: "Du är min vän.", en: "You are my friend." },
          { es: "Él vive en Madrid.", sv: "Han bor i Madrid.", en: "He lives in Madrid." },
          { es: "Ella es profesora.", sv: "Hon är lärare.", en: "She is a teacher." },
          { es: "Nosotros estudiamos mucho.", sv: "Vi pluggar mycket.", en: "We study a lot." },
        ],
        tip: {
          sv: "Pronomenet kan ofta utelämnas: 'Hablo español' = 'Yo hablo español'. Man lägger till pronomenet för att betona vem.",
          en: "The pronoun can often be dropped: 'Hablo español' = 'Yo hablo español'. Add the pronoun to emphasize who."
        }
      },
      {
        heading: { sv: "Tú vs Usted", en: "Tú vs Usted" },
        explanation: {
          sv: "'Tú' är informellt och används med vänner, familj och jämnåriga. 'Usted' (förkortat Ud.) är formellt och används med äldre, okända och i formella situationer. 'Usted' böjs som tredje person (él/ella).",
          en: "'Tú' is informal, used with friends, family, and peers. 'Usted' (abbreviated Ud.) is formal, used with elders, strangers, and in formal settings. 'Usted' conjugates like third person (él/ella)."
        },
        examples: [
          { es: "¿Cómo estás? (tú)", sv: "Hur mår du? (informellt)", en: "How are you? (informal)" },
          { es: "¿Cómo está usted? (formal)", sv: "Hur mår ni? (formellt)", en: "How are you? (formal)" },
        ],
        tip: {
          sv: "I Latinamerika används 'ustedes' för alla (formellt OCH informellt plural). 'Vosotros' används mest i Spanien.",
          en: "In Latin America, 'ustedes' is used for everyone (formal AND informal plural). 'Vosotros' is mainly used in Spain."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Vilket pronomen betyder 'jag'?", en: "Which pronoun means 'I'?" }, answer: "yo", options: ["yo", "tú", "él", "nosotros"], hint: { sv: "Första person singular", en: "First person singular" } },
      { type: "multiple-choice", question: { sv: "Vilket pronomen betyder 'de' (maskulinum)?", en: "Which pronoun means 'they' (masculine)?" }, answer: "ellos", options: ["nosotros", "vosotros", "ellos", "ustedes"], hint: { sv: "Tredje person plural maskulinum", en: "Third person plural masculine" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt pronomen: ___ eres mi amigo.", en: "Fill in the pronoun: ___ are my friend." }, prompt: "___ eres mi amigo.", answer: "Tú", hint: { sv: "'Eres' hör till 'tú'", en: "'Eres' goes with 'tú'" } },
      { type: "fill-blank", question: { sv: "Fyll i: ___ vivimos en Suecia.", en: "Fill in: ___ live in Sweden." }, prompt: "___ vivimos en Suecia.", answer: "Nosotros", hint: { sv: "'Vivimos' = vi bor → nosotros", en: "'Vivimos' = we live → nosotros" } },
      { type: "multiple-choice", question: { sv: "¿Cómo ___ usted? (estar – formellt)", en: "How ___ you? (estar – formal)" }, answer: "está", options: ["estás", "está", "estoy", "están"], hint: { sv: "Usted böjs som tredje person", en: "Usted conjugates as third person" } },
      { type: "translate", question: { sv: "Översätt: Hon talar spanska.", en: "Translate: She speaks Spanish." }, answer: "Ella habla español.", hint: { sv: "Ella + hablar (tredje person)", en: "Ella + hablar (third person)" } },
    ]
  },

  // 2. Definite articles
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
          sv: "Vissa substantiv följer inte de vanliga reglerna. Viktiga undantag: substantiv som slutar på -ma, -ta, -pa är ofta maskulina trots att de slutar på -a.",
          en: "Some nouns don't follow the usual patterns. Important exceptions: nouns ending in -ma, -ta, -pa are often masculine despite ending in -a."
        },
        examples: [
          { es: "el problema", sv: "problemet", en: "the problem" },
          { es: "el tema", sv: "temat", en: "the theme" },
          { es: "el día", sv: "dagen", en: "the day" },
          { es: "la mano", sv: "handen", en: "the hand" },
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
        ]
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ libro", answer: "el", hint: { sv: "'Libro' slutar på -o och är maskulint", en: "'Libro' ends in -o and is masculine" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ casa", answer: "la", hint: { sv: "'Casa' slutar på -a och är feminint", en: "'Casa' ends in -a and is feminine" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel passar? ___ mesa", en: "Which article fits? ___ mesa" }, answer: "la", options: ["el", "la", "los", "las"], hint: { sv: "'Mesa' är femininum singular", en: "'Mesa' is feminine singular" } },
      { type: "multiple-choice", question: { sv: "Vilken artikel passar? ___ problema", en: "Which article fits? ___ problema" }, answer: "el", options: ["el", "la", "los", "las"], hint: { sv: "'Problema' slutar på -ma och är maskulint!", en: "'Problema' ends in -ma and is masculine!" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt artikel", en: "Fill in the correct article" }, prompt: "___ mano", answer: "la", hint: { sv: "Oregelbundet: 'mano' är femininum trots -o!", en: "Irregular: 'mano' is feminine despite -o!" } },
      { type: "translate", question: { sv: "Översätt: problemen", en: "Translate: the problems" }, answer: "los problemas", hint: { sv: "'Problema' är maskulint plural", en: "'Problema' is masculine plural" } },
      { type: "error-correction", question: { sv: "Rätta felet i meningen", en: "Correct the error in the sentence" }, incorrectSentence: "La problema es difícil.", answer: "El problema es difícil.", hint: { sv: "'Problema' är maskulint trots -a", en: "'Problema' is masculine despite -a" } },
    ]
  },

  // 3. Indefinite articles
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
      { type: "translate", question: { sv: "Översätt: en hund", en: "Translate: a dog" }, answer: "un perro", hint: { sv: "Maskulinum singular + 'perro'", en: "Masculine singular + 'perro'" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Un flor bonita.", answer: "Una flor bonita.", hint: { sv: "'Flor' är feminint", en: "'Flor' is feminine" } },
    ]
  },

  // 4. Basic negation
  {
    id: "basic-negation",
    title: { sv: "Grundläggande negation (no)", en: "Basic negation (no)" },
    level: "A1",
    category: "sentence-structure",
    sections: [
      {
        heading: { sv: "Att säga 'inte' på spanska", en: "Saying 'not' in Spanish" },
        explanation: {
          sv: "För att göra en mening nekande placerar du 'no' direkt FÖRE verbet. Det är enklare än på svenska!",
          en: "To make a sentence negative, place 'no' directly BEFORE the verb. It's simpler than in English!"
        },
        examples: [
          { es: "No hablo inglés.", sv: "Jag talar inte engelska.", en: "I don't speak English." },
          { es: "Ella no come carne.", sv: "Hon äter inte kött.", en: "She doesn't eat meat." },
          { es: "No tengo dinero.", sv: "Jag har inga pengar.", en: "I don't have money." },
        ],
        tip: {
          sv: "Dubbel negation är korrekt på spanska: 'No tengo nada' (Jag har ingenting). På svenska/engelska låter det fel, men på spanska är det rätt!",
          en: "Double negation is correct in Spanish: 'No tengo nada' (I have nothing). In English it sounds wrong, but in Spanish it's correct!"
        }
      },
      {
        heading: { sv: "Negativa ord", en: "Negative words" },
        explanation: {
          sv: "Vanliga negativa ord: nada (ingenting), nadie (ingen), nunca (aldrig), tampoco (inte heller). De kan stå efter verbet (med 'no' före) eller ensamma före verbet.",
          en: "Common negative words: nada (nothing), nadie (nobody), nunca (never), tampoco (neither). They can go after the verb (with 'no' before) or alone before the verb."
        },
        examples: [
          { es: "No sé nada.", sv: "Jag vet ingenting.", en: "I don't know anything." },
          { es: "Nunca como pescado.", sv: "Jag äter aldrig fisk.", en: "I never eat fish." },
          { es: "Yo tampoco.", sv: "Jag inte heller.", en: "Me neither." },
        ]
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Gör meningen nekande", en: "Make the sentence negative" }, prompt: "___ hablo inglés.", answer: "No", hint: { sv: "Placera 'no' före verbet", en: "Place 'no' before the verb" } },
      { type: "multiple-choice", question: { sv: "Ella ___ come carne.", en: "She ___ eat meat." }, answer: "no", options: ["no", "non", "ni", "ne"], hint: { sv: "Spansk negation = 'no'", en: "Spanish negation = 'no'" } },
      { type: "fill-blank", question: { sv: "Fyll i: No sé ___. (ingenting)", en: "Fill in: I don't know ___. (nothing)" }, prompt: "No sé ___.", answer: "nada", hint: { sv: "Ingenting = nada", en: "Nothing = nada" } },
      { type: "translate", question: { sv: "Översätt: Jag äter aldrig fisk.", en: "Translate: I never eat fish." }, answer: "Nunca como pescado.", hint: { sv: "Nunca = aldrig, före verbet", en: "Nunca = never, before the verb" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Hablo no inglés.", answer: "No hablo inglés.", hint: { sv: "'No' måste stå FÖRE verbet", en: "'No' must go BEFORE the verb" } },
    ]
  },

  // 5. Question words
  {
    id: "question-words",
    title: { sv: "Frågeord (qué, quién, dónde...)", en: "Question words (qué, quién, dónde...)" },
    level: "A1",
    category: "sentence-structure",
    sections: [
      {
        heading: { sv: "De viktigaste frågeorden", en: "The most important question words" },
        explanation: {
          sv: "Alla spanska frågeord har accent: ¿Qué? (Vad?), ¿Quién? (Vem?), ¿Dónde? (Var?), ¿Cuándo? (När?), ¿Cómo? (Hur?), ¿Cuánto/a? (Hur mycket?), ¿Por qué? (Varför?), ¿Cuál? (Vilken?).",
          en: "All Spanish question words have an accent: ¿Qué? (What?), ¿Quién? (Who?), ¿Dónde? (Where?), ¿Cuándo? (When?), ¿Cómo? (How?), ¿Cuánto/a? (How much?), ¿Por qué? (Why?), ¿Cuál? (Which?)."
        },
        examples: [
          { es: "¿Qué es esto?", sv: "Vad är det här?", en: "What is this?" },
          { es: "¿Dónde vives?", sv: "Var bor du?", en: "Where do you live?" },
          { es: "¿Cómo te llamas?", sv: "Vad heter du?", en: "What is your name?" },
          { es: "¿Cuántos años tienes?", sv: "Hur gammal är du?", en: "How old are you?" },
          { es: "¿Por qué estudias español?", sv: "Varför pluggar du spanska?", en: "Why do you study Spanish?" },
        ],
        tip: {
          sv: "Spanska frågor har omvänt frågetecken ¿ i början! Det finns inget annat europeiskt språk som gör så.",
          en: "Spanish questions have an inverted question mark ¿ at the beginning! No other European language does this."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "___ es esto? (Vad)", en: "___ is this? (What)" }, answer: "¿Qué", options: ["¿Qué", "¿Quién", "¿Dónde", "¿Cómo"], hint: { sv: "Vad = Qué", en: "What = Qué" } },
      { type: "fill-blank", question: { sv: "Fyll i frågeordet: ___ vives? (Var)", en: "Fill in: ___ do you live? (Where)" }, prompt: "¿___ vives?", answer: "Dónde", hint: { sv: "Var = Dónde", en: "Where = Dónde" } },
      { type: "fill-blank", question: { sv: "Fyll i: ¿___ te llamas? (Hur/Vad)", en: "Fill in: What is your ___? (How)" }, prompt: "¿___ te llamas?", answer: "Cómo", hint: { sv: "'Vad heter du' = ¿Cómo te llamas?", en: "'What is your name' = ¿Cómo te llamas?" } },
      { type: "multiple-choice", question: { sv: "¿___ estudias español? (Varför)", en: "___do you study Spanish? (Why)" }, answer: "Por qué", options: ["Qué", "Por qué", "Cómo", "Cuándo"], hint: { sv: "Varför = Por qué (två ord)", en: "Why = Por qué (two words)" } },
      { type: "translate", question: { sv: "Översätt: Var bor du?", en: "Translate: Where do you live?" }, answer: "¿Dónde vives?", hint: { sv: "Var = Dónde + vivir (tú)", en: "Where = Dónde + vivir (tú)" } },
    ]
  },

  // 6. Ser vs Estar
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

  // 7. Hay vs Es/Está
  {
    id: "hay-vs-ser-estar",
    title: { sv: "Hay vs Es/Está – det finns", en: "Hay vs Es/Está – there is/are" },
    level: "A1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Hay – det finns", en: "Hay – there is / there are" },
        explanation: {
          sv: "'Hay' betyder 'det finns' och används med obestämda eller räknade saker. Det ändras INTE för plural. Samma form för singular och plural.",
          en: "'Hay' means 'there is / there are' and is used with indefinite or counted things. It does NOT change for plural. Same form for singular and plural."
        },
        examples: [
          { es: "Hay un gato en el jardín.", sv: "Det finns en katt i trädgården.", en: "There is a cat in the garden." },
          { es: "Hay muchos libros.", sv: "Det finns många böcker.", en: "There are many books." },
          { es: "¿Hay leche?", sv: "Finns det mjölk?", en: "Is there milk?" },
        ]
      },
      {
        heading: { sv: "Skillnaden: hay vs está/están", en: "The difference: hay vs está/están" },
        explanation: {
          sv: "'Hay' = det finns (nytt/obestämt). 'Está/Están' = det befinner sig (känt/bestämt). Jämför: 'Hay un banco en la esquina' (det finns en bank) vs 'El banco está en la esquina' (banken ligger i hörnet).",
          en: "'Hay' = there is (new/indefinite). 'Está/Están' = it is located (known/definite). Compare: 'Hay un banco en la esquina' (there is a bank) vs 'El banco está en la esquina' (the bank is on the corner)."
        },
        examples: [
          { es: "Hay una farmacia cerca.", sv: "Det finns ett apotek i närheten.", en: "There is a pharmacy nearby." },
          { es: "La farmacia está cerca.", sv: "Apoteket ligger nära.", en: "The pharmacy is nearby." },
        ],
        tip: {
          sv: "Tumregel: un/una/muchos/tres + HAY. El/la/mi/este + ESTÁ.",
          en: "Rule of thumb: un/una/muchos/tres + HAY. El/la/mi/este + ESTÁ."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "___ un gato en el jardín. (det finns)", en: "___ a cat in the garden. (there is)" }, answer: "Hay", options: ["Hay", "Es", "Está", "Tiene"], hint: { sv: "Det finns (obestämt) = Hay", en: "There is (indefinite) = Hay" } },
      { type: "multiple-choice", question: { sv: "El banco ___ en la esquina. (befinner sig)", en: "The bank ___ on the corner. (is located)" }, answer: "está", options: ["hay", "es", "está", "son"], hint: { sv: "Bestämt + plats = está", en: "Definite + location = está" } },
      { type: "fill-blank", question: { sv: "Fyll i hay eller está", en: "Fill in hay or está" }, prompt: "___ una farmacia cerca.", answer: "Hay", hint: { sv: "Una (obestämt) → Hay", en: "Una (indefinite) → Hay" } },
      { type: "fill-blank", question: { sv: "Fyll i hay eller está", en: "Fill in hay or está" }, prompt: "La farmacia ___ cerca.", answer: "está", hint: { sv: "La (bestämt) → está", en: "La (definite) → está" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Está un gato en el jardín.", answer: "Hay un gato en el jardín.", hint: { sv: "Un (obestämt) → Hay, inte Está", en: "Un (indefinite) → Hay, not Está" } },
    ]
  },

  // 8. Present tense regular verbs
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
          sv: "Några av de vanligaste verben är helt oregelbundna: tener (ha), hacer (göra), ir (gå), venir (komma), decir (säga).",
          en: "Some of the most common verbs are completely irregular: tener (to have), hacer (to do/make), ir (to go), venir (to come), decir (to say)."
        },
        examples: [
          { es: "Yo tengo un gato.", sv: "Jag har en katt.", en: "I have a cat." },
          { es: "Tú haces la tarea.", sv: "Du gör läxan.", en: "You do the homework." },
          { es: "Él viene mañana.", sv: "Han kommer imorgon.", en: "He comes tomorrow." },
        ],
        tip: {
          sv: "Första person (yo) är ofta mest oregelbunden: tengo, hago, salgo, vengo, digo.",
          en: "First person (yo) is often the most irregular: tengo, hago, salgo, vengo, digo."
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Böj verbet 'hablar' (yo)", en: "Conjugate 'hablar' (yo)" }, prompt: "Yo ___ español.", answer: "hablo", hint: { sv: "-ar verb: yo → -o", en: "-ar verb: yo → -o" } },
      { type: "fill-blank", question: { sv: "Böj verbet 'comer' (ella)", en: "Conjugate 'comer' (ella)" }, prompt: "Ella ___ fruta.", answer: "come", hint: { sv: "-er verb: él/ella → -e", en: "-er verb: él/ella → -e" } },
      { type: "fill-blank", question: { sv: "Böj verbet 'vivir' (nosotros)", en: "Conjugate 'vivir' (nosotros)" }, prompt: "Nosotros ___ en Madrid.", answer: "vivimos", hint: { sv: "-ir verb: nosotros → -imos", en: "-ir verb: nosotros → -imos" } },
      { type: "multiple-choice", question: { sv: "Tú ___ mucho. (hablar)", en: "Tú ___ a lot. (hablar)" }, answer: "hablas", options: ["hablo", "hablas", "habla", "hablamos"], hint: { sv: "-ar verb: tú → -as", en: "-ar verb: tú → -as" } },
      { type: "fill-blank", question: { sv: "Böj oregelbundet verb 'tener' (yo)", en: "Conjugate irregular 'tener' (yo)" }, prompt: "Yo ___ un gato.", answer: "tengo", hint: { sv: "Oregelbundet: tener → tengo", en: "Irregular: tener → tengo" } },
      { type: "multiple-choice", question: { sv: "Yo ___ a las ocho. (salir)", en: "I ___ at eight. (salir)" }, answer: "salgo", options: ["salo", "sale", "salgo", "sales"], hint: { sv: "Oregelbundet: salir → salgo", en: "Irregular: salir → salgo" } },
      { type: "translate", question: { sv: "Översätt: Jag har en katt.", en: "Translate: I have a cat." }, answer: "Yo tengo un gato.", hint: { sv: "tener → tengo (oregelbundet)", en: "tener → tengo (irregular)" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Yo teno un perro.", answer: "Yo tengo un perro.", hint: { sv: "tener är oregelbundet: tengo", en: "tener is irregular: tengo" } },
    ]
  },

  // 9. Adjective agreement
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
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Skriv rätt form av 'alto' (femininum)", en: "Write correct form of 'alto' (feminine)" }, prompt: "La chica es ___.", answer: "alta", hint: { sv: "-o → -a i femininum", en: "-o → -a in feminine" } },
      { type: "fill-blank", question: { sv: "Skriv rätt pluralform av 'alto' (maskulinum)", en: "Write correct plural of 'alto' (masculine)" }, prompt: "Los chicos son ___.", answer: "altos", hint: { sv: "Plural: lägg till -s", en: "Plural: add -s" } },
      { type: "multiple-choice", question: { sv: "Las casas son ___. (grande)", en: "The houses are ___. (grande)" }, answer: "grandes", options: ["grande", "grandes", "grando", "grandos"], hint: { sv: "'Grande' slutar på -e, plural = -es", en: "'Grande' ends in -e, plural = -es" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "La chica es alto.", answer: "La chica es alta.", hint: { sv: "Femininum: -o → -a", en: "Feminine: -o → -a" } },
      { type: "translate", question: { sv: "Översätt: Pojkarna är långa.", en: "Translate: The boys are tall." }, answer: "Los chicos son altos.", hint: { sv: "Maskulinum plural: alto → altos", en: "Masculine plural: alto → altos" } },
    ]
  },

  // 10. Basic prepositions
  {
    id: "basic-prepositions",
    title: { sv: "Grundläggande prepositioner (en, de, a, con)", en: "Basic prepositions (en, de, a, con)" },
    level: "A1",
    category: "prepositions",
    sections: [
      {
        heading: { sv: "De vanligaste prepositionerna", en: "The most common prepositions" },
        explanation: {
          sv: "'En' = i/på, 'de' = av/från, 'a' = till, 'con' = med, 'sin' = utan. Notera att 'a + el' dras ihop till 'al' och 'de + el' till 'del'.",
          en: "'En' = in/on, 'de' = of/from, 'a' = to, 'con' = with, 'sin' = without. Note that 'a + el' contracts to 'al' and 'de + el' to 'del'."
        },
        examples: [
          { es: "Vivo en Madrid.", sv: "Jag bor i Madrid.", en: "I live in Madrid." },
          { es: "Soy de Suecia.", sv: "Jag är från Sverige.", en: "I'm from Sweden." },
          { es: "Voy al parque.", sv: "Jag går till parken.", en: "I go to the park." },
          { es: "Café con leche.", sv: "Kaffe med mjölk.", en: "Coffee with milk." },
          { es: "La casa del profesor.", sv: "Lärarens hus.", en: "The teacher's house." },
        ],
        tip: {
          sv: "Kom ihåg sammandragningarna: a + el = al, de + el = del. Dessa är obligatoriska!",
          en: "Remember the contractions: a + el = al, de + el = del. These are mandatory!"
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: Vivo ___ Madrid.", en: "Fill in: I live ___ Madrid." }, prompt: "Vivo ___ Madrid.", answer: "en", hint: { sv: "I/på = en", en: "In/on = en" } },
      { type: "fill-blank", question: { sv: "Fyll i: Soy ___ Suecia.", en: "Fill in: I'm ___ Sweden." }, prompt: "Soy ___ Suecia.", answer: "de", hint: { sv: "Från = de", en: "From = de" } },
      { type: "multiple-choice", question: { sv: "Voy ___ parque. (a + el)", en: "I go ___ the park. (a + el)" }, answer: "al", options: ["a el", "al", "a la", "del"], hint: { sv: "a + el dras ihop till 'al'", en: "a + el contracts to 'al'" } },
      { type: "fill-blank", question: { sv: "Fyll i sammandragningen: La casa ___ profesor.", en: "Fill in the contraction: The ___ teacher's house." }, prompt: "La casa ___ profesor.", answer: "del", hint: { sv: "de + el = del", en: "de + el = del" } },
      { type: "translate", question: { sv: "Översätt: Kaffe med mjölk.", en: "Translate: Coffee with milk." }, answer: "Café con leche.", hint: { sv: "Med = con", en: "With = con" } },
    ]
  },

  // 11. Possessive adjectives
  {
    id: "possessive-adjectives",
    title: { sv: "Possessiva adjektiv (mi, tu, su...)", en: "Possessive adjectives (mi, tu, su...)" },
    level: "A1",
    category: "adjectives",
    sections: [
      {
        heading: { sv: "Possessiva adjektiv – kort form", en: "Possessive adjectives – short form" },
        explanation: {
          sv: "mi/mis (min/mina), tu/tus (din/dina), su/sus (hans/hennes/er/deras), nuestro/a/os/as (vår/våra), vuestro/a/os/as (er/era). De korta formerna står FÖRE substantivet.",
          en: "mi/mis (my), tu/tus (your), su/sus (his/her/your formal/their), nuestro/a/os/as (our), vuestro/a/os/as (your pl.). The short forms go BEFORE the noun."
        },
        examples: [
          { es: "Mi casa es grande.", sv: "Mitt hus är stort.", en: "My house is big." },
          { es: "Tus amigos son simpáticos.", sv: "Dina vänner är trevliga.", en: "Your friends are nice." },
          { es: "Nuestra escuela es nueva.", sv: "Vår skola är ny.", en: "Our school is new." },
        ],
        tip: {
          sv: "'Mi' och 'tu' ändras INTE för genus, bara för plural (mis, tus). Men 'nuestro' ändras: nuestro/nuestra/nuestros/nuestras.",
          en: "'Mi' and 'tu' do NOT change for gender, only for plural (mis, tus). But 'nuestro' changes: nuestro/nuestra/nuestros/nuestras."
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: ___ casa es grande. (min)", en: "Fill in: ___ house is big. (my)" }, prompt: "___ casa es grande.", answer: "Mi", hint: { sv: "Min = mi", en: "My = mi" } },
      { type: "multiple-choice", question: { sv: "___ amigos son simpáticos. (dina)", en: "___ friends are nice. (your)" }, answer: "Tus", options: ["Tu", "Tus", "Mi", "Su"], hint: { sv: "Dina (plural) = tus", en: "Your (plural) = tus" } },
      { type: "fill-blank", question: { sv: "Fyll i: ___ escuela es nueva. (vår, femininum)", en: "Fill in: ___ school is new. (our, feminine)" }, prompt: "___ escuela es nueva.", answer: "Nuestra", hint: { sv: "Vår (femininum) = nuestra", en: "Our (feminine) = nuestra" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Nuestro escuela es nueva.", answer: "Nuestra escuela es nueva.", hint: { sv: "Escuela är femininum → nuestra", en: "Escuela is feminine → nuestra" } },
      { type: "translate", question: { sv: "Översätt: Mitt hus är stort.", en: "Translate: My house is big." }, answer: "Mi casa es grande.", hint: { sv: "mi + casa + es grande", en: "mi + casa + es grande" } },
    ]
  },

  // ═══════════════════════════════════════════
  // A2 – ELEMENTARY
  // ═══════════════════════════════════════════

  // 1. Preterite regular
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
      },
      {
        heading: { sv: "Oregelbundna verb i preteritum", en: "Irregular verbs in preterite" },
        explanation: {
          sv: "Många vanliga verb har oregelbunden preteritum: ser/ir → fui, hacer → hice, tener → tuve, estar → estuve, poder → pude, decir → dije.",
          en: "Many common verbs have irregular preterite forms: ser/ir → fui, hacer → hice, tener → tuve, estar → estuve, poder → pude, decir → dije."
        },
        examples: [
          { es: "Fui al cine ayer.", sv: "Jag gick på bio igår.", en: "I went to the cinema yesterday." },
          { es: "Hice la tarea.", sv: "Jag gjorde läxan.", en: "I did the homework." },
          { es: "Tuvimos una fiesta.", sv: "Vi hade en fest.", en: "We had a party." },
        ],
        tip: {
          sv: "Notera: Ser och ir har SAMMA preteritumform (fui, fuiste, fue...)!",
          en: "Note: Ser and ir have the SAME preterite form (fui, fuiste, fue...)!"
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Böj 'hablar' i preteritum (yo)", en: "Conjugate 'hablar' in preterite (yo)" }, prompt: "Yo ___ con María ayer.", answer: "hablé", hint: { sv: "-ar verb: yo → -é", en: "-ar verb: yo → -é" } },
      { type: "fill-blank", question: { sv: "Böj 'comer' i preteritum (yo)", en: "Conjugate 'comer' in preterite (yo)" }, prompt: "Yo ___ paella en Valencia.", answer: "comí", hint: { sv: "-er verb: yo → -í", en: "-er verb: yo → -í" } },
      { type: "multiple-choice", question: { sv: "Ella ___ un vestido. (comprar)", en: "She ___ a dress. (comprar)" }, answer: "compró", options: ["compré", "compraste", "compró", "compraron"], hint: { sv: "Ella → tredje person singular", en: "Ella → third person singular" } },
      { type: "fill-blank", question: { sv: "Böj oregelbundet 'ir' i preteritum (yo)", en: "Conjugate irregular 'ir' in preterite (yo)" }, prompt: "Yo ___ al cine ayer.", answer: "fui", hint: { sv: "Oregelbundet: ir → fui", en: "Irregular: ir → fui" } },
      { type: "multiple-choice", question: { sv: "Nosotros ___ una fiesta. (tener)", en: "We ___ a party. (tener)" }, answer: "tuvimos", options: ["tenimos", "tuvimos", "tenemos", "tuvieron"], hint: { sv: "Oregelbundet: tener → tuv- + imos", en: "Irregular: tener → tuv- + imos" } },
      { type: "translate", question: { sv: "Översätt: Jag gjorde läxan.", en: "Translate: I did the homework." }, answer: "Yo hice la tarea.", hint: { sv: "hacer → hice (oregelbundet)", en: "hacer → hice (irregular)" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Yo fué al cine.", answer: "Yo fui al cine.", hint: { sv: "Yo fui (inte fué - ingen accent!)", en: "Yo fui (not fué - no accent!)" } },
    ]
  },

  // 2. Reflexive verbs
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
      { type: "translate", question: { sv: "Översätt: Jag går upp klockan sju.", en: "Translate: I get up at seven." }, answer: "Me levanto a las siete.", hint: { sv: "levantarse → me levanto", en: "levantarse → me levanto" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Ella levanta por la mañana.", answer: "Ella se levanta por la mañana.", hint: { sv: "Reflexivt pronomen saknas: se", en: "Reflexive pronoun missing: se" } },
    ]
  },

  // 3. Comparatives
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
        heading: { sv: "Oregelbundna komparativa former", en: "Irregular comparative forms" },
        explanation: {
          sv: "Bueno → mejor (bättre), malo → peor (sämre), grande → mayor (äldre), pequeño → menor (yngre). Används UTAN 'más'.",
          en: "Bueno → mejor (better), malo → peor (worse), grande → mayor (older), pequeño → menor (younger). Used WITHOUT 'más'."
        },
        examples: [
          { es: "Este vino es mejor que ese.", sv: "Det här vinet är bättre än det där.", en: "This wine is better than that one." },
          { es: "Mi nota es peor que la tuya.", sv: "Mitt betyg är sämre än ditt.", en: "My grade is worse than yours." },
        ],
        tip: {
          sv: "Säg INTE 'más mejor' eller 'más peor' – det är fel!",
          en: "Do NOT say 'más mejor' or 'más peor' – it's wrong!"
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: María es ___ alta que Pedro.", en: "Fill in: María is ___ tall than Pedro." }, prompt: "María es ___ alta que Pedro.", answer: "más", hint: { sv: "Mer = más", en: "More = más" } },
      { type: "multiple-choice", question: { sv: "Este vino es ___ que ese. (bueno)", en: "This wine is ___ than that one. (bueno)" }, answer: "mejor", options: ["más bueno", "mejor", "más mejor", "buenor"], hint: { sv: "Oregelbundet: bueno → mejor", en: "Irregular: bueno → mejor" } },
      { type: "fill-blank", question: { sv: "Fyll i oregelbunden form av 'malo' (sämre)", en: "Fill in irregular form of 'malo' (worse)" }, prompt: "Mi nota es ___ que la tuya.", answer: "peor", hint: { sv: "malo → peor", en: "malo → peor" } },
      { type: "translate", question: { sv: "Översätt: Det är den sämsta dagen.", en: "Translate: It's the worst day." }, answer: "Es el peor día.", hint: { sv: "Oregelbunden superlativ: peor", en: "Irregular superlative: peor" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Este vino es más mejor.", answer: "Este vino es mejor.", hint: { sv: "Säg INTE 'más mejor' - bara 'mejor'", en: "Do NOT say 'más mejor' - just 'mejor'" } },
    ]
  },

  // 4. Gustar and similar verbs
  {
    id: "gustar-verbs",
    title: { sv: "Gustar och liknande verb", en: "Gustar and similar verbs" },
    level: "A2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Hur gustar fungerar", en: "How gustar works" },
        explanation: {
          sv: "'Gustar' fungerar annorlunda: det som du gillar är subjektet. Du säger 'A mí me gusta el café' (Kaffet behagar mig). Använd 'gusta' med singular/infinitiv och 'gustan' med plural.",
          en: "'Gustar' works differently: what you like is the subject. You say 'A mí me gusta el café' (Coffee pleases me). Use 'gusta' with singular/infinitive and 'gustan' with plural."
        },
        examples: [
          { es: "Me gusta el café.", sv: "Jag gillar kaffe.", en: "I like coffee." },
          { es: "Me gustan los gatos.", sv: "Jag gillar katter.", en: "I like cats." },
          { es: "Le gusta bailar.", sv: "Han/Hon gillar att dansa.", en: "He/She likes to dance." },
          { es: "Nos gustan las películas.", sv: "Vi gillar filmer.", en: "We like movies." },
        ],
        tip: {
          sv: "Indirekt objektspronomen: me (jag), te (du), le (han/hon/ni), nos (vi), os (ni), les (de/ni).",
          en: "Indirect object pronouns: me (I), te (you), le (he/she/you formal), nos (we), os (you all), les (they/you all)."
        }
      },
      {
        heading: { sv: "Liknande verb", en: "Similar verbs" },
        explanation: {
          sv: "Andra verb som fungerar som gustar: encantar (älska), interesar (intressera), molestar (störa), importar (betyda), parecer (tyckas).",
          en: "Other verbs that work like gustar: encantar (to love), interesar (to interest), molestar (to bother), importar (to matter), parecer (to seem)."
        },
        examples: [
          { es: "Me encanta la música.", sv: "Jag älskar musik.", en: "I love music." },
          { es: "¿Te interesa la historia?", sv: "Intresserar du dig för historia?", en: "Are you interested in history?" },
        ]
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Me ___ el café. (gilla, singular)", en: "I ___ coffee. (like, singular)" }, answer: "gusta", options: ["gusta", "gustan", "gusto", "gustas"], hint: { sv: "Singular → gusta", en: "Singular → gusta" } },
      { type: "multiple-choice", question: { sv: "Me ___ los gatos. (gilla, plural)", en: "I ___ cats. (like, plural)" }, answer: "gustan", options: ["gusta", "gustan", "gusto", "gustas"], hint: { sv: "Plural → gustan", en: "Plural → gustan" } },
      { type: "fill-blank", question: { sv: "Fyll i: ___ gusta bailar. (till honom)", en: "Fill in: ___ likes to dance. (he)" }, prompt: "___ gusta bailar.", answer: "Le", hint: { sv: "Han/hon → le", en: "He/she → le" } },
      { type: "translate", question: { sv: "Översätt: Jag älskar musik.", en: "Translate: I love music." }, answer: "Me encanta la música.", hint: { sv: "Encantar fungerar som gustar", en: "Encantar works like gustar" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Me gustan el café.", answer: "Me gusta el café.", hint: { sv: "Singular (el café) → gusta", en: "Singular (el café) → gusta" } },
    ]
  },

  // 5. Ir a + infinitive (near future)
  {
    id: "ir-a-infinitive",
    title: { sv: "Nära framtid: ir a + infinitiv", en: "Near future: ir a + infinitive" },
    level: "A2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Hur man uttrycker framtid med ir a", en: "Expressing future with ir a" },
        explanation: {
          sv: "Det enklaste sättet att uttrycka framtid på spanska: böj 'ir' (voy, vas, va, vamos, vais, van) + 'a' + infinitiv. Jämför med svenskans 'ska/kommer att'.",
          en: "The simplest way to express future in Spanish: conjugate 'ir' (voy, vas, va, vamos, vais, van) + 'a' + infinitive. Compare to English 'going to'."
        },
        examples: [
          { es: "Voy a estudiar esta noche.", sv: "Jag ska plugga ikväll.", en: "I'm going to study tonight." },
          { es: "¿Vas a venir mañana?", sv: "Ska du komma imorgon?", en: "Are you going to come tomorrow?" },
          { es: "Vamos a comer paella.", sv: "Vi ska äta paella.", en: "We're going to eat paella." },
        ],
        tip: {
          sv: "Detta är det vanligaste sättet att prata om framtiden i vardagsspanska. Futurum (hablaré) används mer formellt.",
          en: "This is the most common way to talk about the future in everyday Spanish. Future tense (hablaré) is more formal."
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: Yo ___ a estudiar. (ir, yo)", en: "Fill in: I ___ to study. (ir, yo)" }, prompt: "Yo ___ a estudiar.", answer: "voy", hint: { sv: "Ir: yo → voy", en: "Ir: yo → voy" } },
      { type: "multiple-choice", question: { sv: "¿Tú ___ a venir mañana?", en: "Are you ___ to come tomorrow?" }, answer: "vas", options: ["voy", "vas", "va", "vamos"], hint: { sv: "Ir: tú → vas", en: "Ir: tú → vas" } },
      { type: "fill-blank", question: { sv: "Fyll i: Nosotros ___ a comer paella.", en: "Fill in: We ___ to eat paella." }, prompt: "Nosotros ___ a comer paella.", answer: "vamos", hint: { sv: "Ir: nosotros → vamos", en: "Ir: nosotros → vamos" } },
      { type: "translate", question: { sv: "Översätt: Jag ska plugga ikväll.", en: "Translate: I'm going to study tonight." }, answer: "Voy a estudiar esta noche.", hint: { sv: "voy + a + estudiar", en: "voy + a + estudiar" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Yo va a estudiar.", answer: "Yo voy a estudiar.", hint: { sv: "Yo → voy (inte va)", en: "Yo → voy (not va)" } },
    ]
  },

  // 6. Direct object pronouns
  {
    id: "direct-object-pronouns",
    title: { sv: "Direkt objektspronomen (lo, la, los, las)", en: "Direct object pronouns (lo, la, los, las)" },
    level: "A2",
    category: "pronouns",
    sections: [
      {
        heading: { sv: "Vad är direkt objektspronomen?", en: "What are direct object pronouns?" },
        explanation: {
          sv: "Direkt objektspronomen ersätter det direkta objektet: me (mig), te (dig), lo (honom/det), la (henne/det), nos (oss), os (er), los (dem mask.), las (dem fem.). De placeras FÖRE det böjda verbet.",
          en: "Direct object pronouns replace the direct object: me (me), te (you), lo (him/it), la (her/it), nos (us), os (you all), los (them masc.), las (them fem.). They go BEFORE the conjugated verb."
        },
        examples: [
          { es: "¿El libro? Lo tengo.", sv: "Boken? Jag har den.", en: "The book? I have it." },
          { es: "¿La carta? La escribí ayer.", sv: "Brevet? Jag skrev det igår.", en: "The letter? I wrote it yesterday." },
          { es: "¿Los niños? Los veo.", sv: "Barnen? Jag ser dem.", en: "The children? I see them." },
        ],
        tip: {
          sv: "Med infinitiv eller gerundium kan pronomenet också fästas på slutet: 'Voy a comprarlo' = 'Lo voy a comprar'.",
          en: "With infinitive or gerund, the pronoun can also attach to the end: 'Voy a comprarlo' = 'Lo voy a comprar'."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "¿El libro? ___ tengo. (det, mask.)", en: "The book? I have ___. (it, masc.)" }, answer: "Lo", options: ["Lo", "La", "Los", "Las"], hint: { sv: "El libro (mask. sing.) → lo", en: "El libro (masc. sing.) → lo" } },
      { type: "fill-blank", question: { sv: "¿La carta? ___ escribí ayer.", en: "The letter? I wrote ___ yesterday." }, prompt: "¿La carta? ___ escribí ayer.", answer: "La", hint: { sv: "La carta (fem. sing.) → la", en: "La carta (fem. sing.) → la" } },
      { type: "multiple-choice", question: { sv: "¿Los niños? ___ veo.", en: "The children? I see ___." }, answer: "Los", options: ["Lo", "La", "Los", "Las"], hint: { sv: "Los niños (mask. plur.) → los", en: "Los niños (masc. plur.) → los" } },
      { type: "translate", question: { sv: "Översätt: Jag har den (boken).", en: "Translate: I have it (the book)." }, answer: "Lo tengo.", hint: { sv: "El libro → lo, före verbet", en: "El libro → lo, before the verb" } },
    ]
  },

  // ═══════════════════════════════════════════
  // B1 – INTERMEDIATE
  // ═══════════════════════════════════════════

  // 1. Imperfect vs Preterite
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
      { type: "multiple-choice", question: { sv: "Dormía cuando ___ el teléfono. (avbrott)", en: "I was sleeping when the phone ___. (interruption)" }, answer: "sonó", options: ["sonaba", "sonó", "suena", "sonará"], hint: { sv: "Avbrott = preteritum", en: "Interruption = preterite" } },
      { type: "fill-blank", question: { sv: "Fyll i imperfekt av 'llover'", en: "Fill in imperfect of 'llover'" }, prompt: "___ mucho ese día.", answer: "Llovía", hint: { sv: "Bakgrundsbeskrivning = imperfekt", en: "Background description = imperfect" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Cuando fui niño, jugaba en el parque.", answer: "Cuando era niño, jugaba en el parque.", hint: { sv: "'Vara barn' = bakgrund = imperfekt", en: "'Being a child' = background = imperfect" } },
      { type: "translate", question: { sv: "Översätt: Jag sov när telefonen ringde.", en: "Translate: I was sleeping when the phone rang." }, answer: "Dormía cuando sonó el teléfono.", hint: { sv: "Bakgrund (imperfekt) + händelse (preteritum)", en: "Background (imperfect) + event (preterite)" } },
    ]
  },

  // 2. Subjunctive intro
  {
    id: "subjunctive-intro",
    title: { sv: "Introduktion till konjunktiv", en: "Introduction to the subjunctive" },
    level: "B1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Vad är konjunktiv?", en: "What is the subjunctive?" },
        explanation: {
          sv: "Konjunktiv (subjuntivo) används för att uttrycka önskningar, tvivel, känslor och osäkerhet. Den utlöses ofta av 'que' efter vissa verb.",
          en: "The subjunctive (subjuntivo) expresses wishes, doubt, emotions, and uncertainty. It's often triggered by 'que' after certain verbs."
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
      { type: "multiple-choice", question: { sv: "Espero que ___ bien. (estar, tú)", en: "I hope you ___ well. (estar, tú)" }, answer: "estés", options: ["estás", "estés", "estarás", "estabas"], hint: { sv: "Hopp = konjunktiv", en: "Hope = subjunctive" } },
      { type: "fill-blank", question: { sv: "Fyll i konjunktiv av 'ser' (det)", en: "Fill in subjunctive of 'ser' (it)" }, prompt: "No creo que ___ verdad.", answer: "sea", hint: { sv: "Tvivel + que = konjunktiv. Ser → sea", en: "Doubt + que = subjunctive. Ser → sea" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Quiero que vienes a mi fiesta.", answer: "Quiero que vengas a mi fiesta.", hint: { sv: "Efter 'quiero que' = konjunktiv", en: "After 'quiero que' = subjunctive" } },
      { type: "translate", question: { sv: "Översätt: Jag hoppas att du mår bra.", en: "Translate: I hope you're well." }, answer: "Espero que estés bien.", hint: { sv: "Esperar + que + konjunktiv", en: "Esperar + que + subjunctive" } },
    ]
  },

  // 3. Por vs Para
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
        ]
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Estudio ___ aprender. (syfte)", en: "I study ___ learn. (purpose)" }, answer: "para", options: ["por", "para", "de", "a"], hint: { sv: "Syfte = para", en: "Purpose = para" } },
      { type: "multiple-choice", question: { sv: "Gracias ___ tu ayuda. (orsak)", en: "Thanks ___ your help. (cause)" }, answer: "por", options: ["por", "para", "de", "con"], hint: { sv: "Orsak = por", en: "Cause = por" } },
      { type: "fill-blank", question: { sv: "Fyll i por eller para", en: "Fill in por or para" }, prompt: "Este regalo es ___ ti.", answer: "para", hint: { sv: "Mottagare = para", en: "Recipient = para" } },
      { type: "fill-blank", question: { sv: "Fyll i por eller para", en: "Fill in por or para" }, prompt: "Caminé ___ el parque.", answer: "por", hint: { sv: "Rörelse genom = por", en: "Movement through = por" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Gracias para tu ayuda.", answer: "Gracias por tu ayuda.", hint: { sv: "Tacksamhet = por", en: "Gratitude = por" } },
    ]
  },

  // 4. Present perfect
  {
    id: "present-perfect",
    title: { sv: "Perfekt (he hablado, he comido...)", en: "Present perfect (he hablado, he comido...)" },
    level: "B1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Bildning av perfekt", en: "Forming the present perfect" },
        explanation: {
          sv: "Perfekt bildas med haber (he, has, ha, hemos, habéis, han) + participium. Participium: -ar → -ado, -er/-ir → -ido. Oregelbundna: hecho, dicho, escrito, visto, puesto, vuelto, abierto, roto, muerto.",
          en: "Present perfect is formed with haber (he, has, ha, hemos, habéis, han) + past participle. Past participle: -ar → -ado, -er/-ir → -ido. Irregular: hecho, dicho, escrito, visto, puesto, vuelto, abierto, roto, muerto."
        },
        examples: [
          { es: "He comido paella.", sv: "Jag har ätit paella.", en: "I have eaten paella." },
          { es: "¿Has visto esa película?", sv: "Har du sett den filmen?", en: "Have you seen that movie?" },
          { es: "Hemos hecho la tarea.", sv: "Vi har gjort läxan.", en: "We have done the homework." },
        ],
        tip: {
          sv: "ALDRIG separera haber och participium! 'No he comido' (inte 'He no comido').",
          en: "NEVER separate haber and the participle! 'No he comido' (not 'He no comido')."
        }
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: Yo ___ comido paella. (haber, yo)", en: "Fill in: I ___ eaten paella. (haber, yo)" }, prompt: "Yo ___ comido paella.", answer: "he", hint: { sv: "Haber: yo → he", en: "Haber: yo → he" } },
      { type: "multiple-choice", question: { sv: "¿Tú ___ visto esa película?", en: "Have you ___ that movie?" }, answer: "has", options: ["he", "has", "ha", "hemos"], hint: { sv: "Haber: tú → has", en: "Haber: tú → has" } },
      { type: "fill-blank", question: { sv: "Skriv participium av 'hacer'", en: "Write past participle of 'hacer'" }, prompt: "Hemos ___ la tarea.", answer: "hecho", hint: { sv: "Hacer → hecho (oregelbundet)", en: "Hacer → hecho (irregular)" } },
      { type: "translate", question: { sv: "Översätt: Jag har ätit paella.", en: "Translate: I have eaten paella." }, answer: "He comido paella.", hint: { sv: "He + comido (participium av comer)", en: "He + comido (past participle of comer)" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "He no comido nada.", answer: "No he comido nada.", hint: { sv: "'No' ska stå FÖRE haber", en: "'No' goes BEFORE haber" } },
    ]
  },

  // 5. Imperative
  {
    id: "imperative-mood",
    title: { sv: "Imperativ – uppmaningar", en: "Imperative – commands" },
    level: "B1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Positiv imperativ (tú)", en: "Positive imperative (tú)" },
        explanation: {
          sv: "Positiv imperativ för 'tú': -ar → -a, -er → -e, -ir → -e. Oregelbundna: pon (poner), ven (venir), di (decir), haz (hacer), sal (salir), ten (tener), ve (ir), sé (ser).",
          en: "Positive imperative for 'tú': -ar → -a, -er → -e, -ir → -e. Irregular: pon (poner), ven (venir), di (decir), haz (hacer), sal (salir), ten (tener), ve (ir), sé (ser)."
        },
        examples: [
          { es: "¡Habla más despacio!", sv: "Prata långsammare!", en: "Speak more slowly!" },
          { es: "¡Ven aquí!", sv: "Kom hit!", en: "Come here!" },
          { es: "¡Haz la tarea!", sv: "Gör läxan!", en: "Do the homework!" },
        ]
      },
      {
        heading: { sv: "Negativ imperativ (tú)", en: "Negative imperative (tú)" },
        explanation: {
          sv: "Negativ imperativ använder konjunktiv: 'No hables', 'No comas', 'No vengas'. Lägg 'no' före konjunktivformen.",
          en: "Negative imperative uses the subjunctive: 'No hables', 'No comas', 'No vengas'. Put 'no' before the subjunctive form."
        },
        examples: [
          { es: "¡No hables tan rápido!", sv: "Prata inte så fort!", en: "Don't talk so fast!" },
          { es: "¡No comas eso!", sv: "Ät inte det!", en: "Don't eat that!" },
        ],
        tip: {
          sv: "Positiv: 'Habla' (tala!). Negativ: 'No hables' (tala inte!). Formerna är olika!",
          en: "Positive: 'Habla' (speak!). Negative: 'No hables' (don't speak!). The forms are different!"
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "¡___ más despacio! (hablar, tú, positiv)", en: "Speak more slowly! (hablar, tú, positive)" }, answer: "Habla", options: ["Habla", "Hablas", "Hables", "Hablé"], hint: { sv: "Positiv imperativ -ar: -a", en: "Positive imperative -ar: -a" } },
      { type: "fill-blank", question: { sv: "Fyll i oregelbunden imperativ: ¡___ aquí! (venir, tú)", en: "Fill in irregular imperative: Come here! (venir, tú)" }, prompt: "¡___ aquí!", answer: "Ven", hint: { sv: "Venir → ven (oregelbundet)", en: "Venir → ven (irregular)" } },
      { type: "multiple-choice", question: { sv: "¡No ___ tan rápido! (hablar, tú, negativ)", en: "Don't ___ so fast! (hablar, tú, negative)" }, answer: "hables", options: ["habla", "hablas", "hables", "hablé"], hint: { sv: "Negativ imperativ = konjunktiv", en: "Negative imperative = subjunctive" } },
      { type: "translate", question: { sv: "Översätt: Gör läxan! (tú)", en: "Translate: Do the homework! (tú)" }, answer: "¡Haz la tarea!", hint: { sv: "Hacer → haz (oregelbunden imperativ)", en: "Hacer → haz (irregular imperative)" } },
    ]
  },

  // ═══════════════════════════════════════════
  // B2 – UPPER INTERMEDIATE
  // ═══════════════════════════════════════════

  // 1. Subjunctive advanced
  {
    id: "subjunctive-advanced",
    title: { sv: "Konjunktiv – avancerade användningar", en: "Subjunctive – advanced uses" },
    level: "B2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Konjunktiv i bisatser", en: "Subjunctive in subordinate clauses" },
        explanation: {
          sv: "Konjunktiv används efter konjunktioner som 'cuando' (framtid), 'aunque' (även om), 'para que' (för att), 'antes de que' (innan).",
          en: "The subjunctive is used after conjunctions like 'cuando' (future), 'aunque' (even though), 'para que' (so that), 'antes de que' (before)."
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
      { type: "multiple-choice", question: { sv: "Cuando ___, llámame. (llegar, tú)", en: "When you ___, call me. (llegar, tú)" }, answer: "llegues", options: ["llegas", "llegues", "llegarás", "llegaste"], hint: { sv: "Cuando + framtid = konjunktiv", en: "Cuando + future = subjunctive" } },
      { type: "multiple-choice", question: { sv: "Si ___ dinero, viajaría. (tener, yo)", en: "If I ___ money, I would travel. (tener, yo)" }, answer: "tuviera", options: ["tengo", "tenía", "tuviera", "tendré"], hint: { sv: "Si + hypotetisk = konj. imperfekt", en: "Si + hypothetical = imp. subjunctive" } },
      { type: "fill-blank", question: { sv: "Fyll i konjunktiv av 'llover'", en: "Fill in subjunctive of 'llover'" }, prompt: "Aunque ___, iremos.", answer: "llueva", hint: { sv: "Aunque + osäkerhet = konjunktiv", en: "Aunque + uncertainty = subjunctive" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Cuando llegas, llámame.", answer: "Cuando llegues, llámame.", hint: { sv: "Cuando + framtid = konjunktiv", en: "Cuando + future = subjunctive" } },
      { type: "translate", question: { sv: "Översätt: Om jag hade pengar, skulle jag resa.", en: "Translate: If I had money, I would travel." }, answer: "Si tuviera dinero, viajaría.", hint: { sv: "Si + konj. imperfekt + konditionalis", en: "Si + imp. subjunctive + conditional" } },
    ]
  },

  // 2. Conditional sentences
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
          sv: "Si + konjunktiv imperfekt → konditionalis. Beskriver osannolika scenarier.",
          en: "Si + imperfect subjunctive → conditional. Describes unlikely scenarios."
        },
        examples: [
          { es: "Si fuera rico, compraría una isla.", sv: "Om jag vore rik, skulle jag köpa en ö.", en: "If I were rich, I would buy an island." },
        ]
      },
      {
        heading: { sv: "Typ 3: Omöjlig (förflutet)", en: "Type 3: Impossible (past)" },
        explanation: {
          sv: "Si + konjunktiv pluskvamperfekt → konditionalis perfekt.",
          en: "Si + pluperfect subjunctive → conditional perfect."
        },
        examples: [
          { es: "Si hubiera estudiado, habría aprobado.", sv: "Om jag hade pluggat, hade jag klarat det.", en: "If I had studied, I would have passed." },
        ]
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Si estudias, ___. (Typ 1)", en: "If you study, ___. (Type 1)" }, answer: "aprobarás", options: ["apruebas", "aprobarás", "aprobarías", "habrías aprobado"], hint: { sv: "Typ 1: Si + presens → futurum", en: "Type 1: Si + present → future" } },
      { type: "multiple-choice", question: { sv: "Si fuera rico, ___ una isla. (Typ 2)", en: "If I were rich, I ___ an island. (Type 2)" }, answer: "compraría", options: ["compro", "compraré", "compraría", "habría comprado"], hint: { sv: "Typ 2: → konditionalis", en: "Type 2: → conditional" } },
      { type: "fill-blank", question: { sv: "Fyll i rätt verbform (Typ 3)", en: "Fill in correct verb form (Type 3)" }, prompt: "Si hubiera estudiado, ___ aprobado.", answer: "habría", hint: { sv: "Typ 3: habría + participium", en: "Type 3: habría + past participle" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "Si estudias, aprobarías.", answer: "Si estudias, aprobarás.", hint: { sv: "Si + presens → futurum (inte konditionalis)", en: "Si + present → future (not conditional)" } },
      { type: "translate", question: { sv: "Översätt: Om jag vore rik, skulle jag köpa en ö.", en: "Translate: If I were rich, I would buy an island." }, answer: "Si fuera rico, compraría una isla.", hint: { sv: "Si + konj. imperfekt + konditionalis", en: "Si + imp. subjunctive + conditional" } },
    ]
  },

  // 3. Se constructions / passive
  {
    id: "se-constructions",
    title: { sv: "Se-konstruktioner och passiv", en: "Se constructions and passive" },
    level: "B2",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Pasiva refleja (se + verb)", en: "Passive se (se + verb)" },
        explanation: {
          sv: "'Se' + verb i tredje person används för att uttrycka passiv eller opersonliga meningar. Mycket vanligt i vardagsspanska, skyltar och instruktioner.",
          en: "'Se' + third person verb is used to express passive or impersonal sentences. Very common in everyday Spanish, signs, and instructions."
        },
        examples: [
          { es: "Se habla español.", sv: "Man talar spanska. / Spanska talas.", en: "Spanish is spoken." },
          { es: "Se venden casas.", sv: "Hus säljs.", en: "Houses are sold." },
          { es: "¿Cómo se dice 'hund' en español?", sv: "Hur säger man 'hund' på spanska?", en: "How do you say 'dog' in Spanish?" },
          { es: "Se prohíbe fumar.", sv: "Rökning förbjuden.", en: "Smoking is prohibited." },
        ],
        tip: {
          sv: "Verbet böjs efter subjektet: 'Se vende una casa' (singular) vs 'Se venden casas' (plural).",
          en: "The verb agrees with the subject: 'Se vende una casa' (singular) vs 'Se venden casas' (plural)."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Se ___ español aquí. (hablar)", en: "Spanish ___ spoken here. (hablar)" }, answer: "habla", options: ["habla", "hablan", "hablo", "hablamos"], hint: { sv: "Español (singular) → habla", en: "Español (singular) → habla" } },
      { type: "multiple-choice", question: { sv: "Se ___ casas. (vender)", en: "Houses ___ sold. (vender)" }, answer: "venden", options: ["vende", "venden", "vendo", "vendemos"], hint: { sv: "Casas (plural) → venden", en: "Casas (plural) → venden" } },
      { type: "fill-blank", question: { sv: "Fyll i: ¿Cómo ___ dice 'hund' en español?", en: "Fill in: How do you say 'dog' in Spanish?" }, prompt: "¿Cómo ___ dice 'hund' en español?", answer: "se", hint: { sv: "Opersonligt uttryck → se", en: "Impersonal expression → se" } },
      { type: "translate", question: { sv: "Översätt: Rökning förbjuden.", en: "Translate: Smoking is prohibited." }, answer: "Se prohíbe fumar.", hint: { sv: "Se + prohíbe + infinitiv", en: "Se + prohíbe + infinitive" } },
    ]
  },

  // 4. Future tense
  {
    id: "future-tense",
    title: { sv: "Futurum (hablaré, comeré...)", en: "Future tense (hablaré, comeré...)" },
    level: "B2",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Regelbunden futurum", en: "Regular future tense" },
        explanation: {
          sv: "Futurum bildas genom att lägga till ändelser på hela infinitiven: -é, -ás, -á, -emos, -éis, -án. Samma ändelser för alla verbtyper!",
          en: "The future tense is formed by adding endings to the full infinitive: -é, -ás, -á, -emos, -éis, -án. Same endings for all verb types!"
        },
        examples: [
          { es: "Mañana hablaré con ella.", sv: "Imorgon ska jag prata med henne.", en: "Tomorrow I will talk to her." },
          { es: "¿Cuándo llegarás?", sv: "När kommer du?", en: "When will you arrive?" },
        ]
      },
      {
        heading: { sv: "Oregelbundna stammar", en: "Irregular stems" },
        explanation: {
          sv: "Vanliga oregelbundna stammar: tener → tendr-, poder → podr-, saber → sabr-, hacer → har-, decir → dir-, salir → saldr-, venir → vendr-, poner → pondr-, querer → querr-.",
          en: "Common irregular stems: tener → tendr-, poder → podr-, saber → sabr-, hacer → har-, decir → dir-, salir → saldr-, venir → vendr-, poner → pondr-, querer → querr-."
        },
        examples: [
          { es: "Tendré más tiempo mañana.", sv: "Jag kommer ha mer tid imorgon.", en: "I'll have more time tomorrow." },
          { es: "¿Qué harás este fin de semana?", sv: "Vad ska du göra i helgen?", en: "What will you do this weekend?" },
        ]
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Böj 'hablar' i futurum (yo)", en: "Conjugate 'hablar' in future (yo)" }, prompt: "Mañana ___ con ella.", answer: "hablaré", hint: { sv: "Hablar + é = hablaré", en: "Hablar + é = hablaré" } },
      { type: "multiple-choice", question: { sv: "¿Cuándo ___? (llegar, tú)", en: "When will you ___? (llegar, tú)" }, answer: "llegarás", options: ["llegas", "llegaste", "llegarás", "llegarías"], hint: { sv: "Futurum: llegar + ás", en: "Future: llegar + ás" } },
      { type: "fill-blank", question: { sv: "Oregelbunden futurum: tener (yo)", en: "Irregular future: tener (yo)" }, prompt: "___ más tiempo mañana.", answer: "Tendré", hint: { sv: "Tener → tendr- + é", en: "Tener → tendr- + é" } },
      { type: "translate", question: { sv: "Översätt: Vad ska du göra i helgen?", en: "Translate: What will you do this weekend?" }, answer: "¿Qué harás este fin de semana?", hint: { sv: "Hacer → har- + ás", en: "Hacer → har- + ás" } },
    ]
  },

  // ═══════════════════════════════════════════
  // C1 – ADVANCED
  // ═══════════════════════════════════════════

  // 1. Advanced relative clauses
  {
    id: "relative-clauses",
    title: { sv: "Relativsatser (que, quien, cuyo, donde)", en: "Relative clauses (que, quien, cuyo, donde)" },
    level: "C1",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Que vs Quien", en: "Que vs Quien" },
        explanation: {
          sv: "'Que' är det vanligaste relativpronomenet och kan referera till både personer och saker. 'Quien/quienes' refererar bara till personer och används efter prepositioner.",
          en: "'Que' is the most common relative pronoun and can refer to both people and things. 'Quien/quienes' refers only to people and is used after prepositions."
        },
        examples: [
          { es: "El hombre que vimos es mi profesor.", sv: "Mannen som vi såg är min lärare.", en: "The man that we saw is my teacher." },
          { es: "La persona con quien hablé es doctora.", sv: "Personen jag pratade med är läkare.", en: "The person with whom I spoke is a doctor." },
        ]
      },
      {
        heading: { sv: "Cuyo (vars)", en: "Cuyo (whose)" },
        explanation: {
          sv: "'Cuyo/cuya/cuyos/cuyas' betyder 'vars' och böjs efter det substantiv som följer (inte personen det refererar till). Tillhör ett formellare register.",
          en: "'Cuyo/cuya/cuyos/cuyas' means 'whose' and agrees with the following noun (not the person it refers to). It belongs to a more formal register."
        },
        examples: [
          { es: "El autor cuyo libro leí es colombiano.", sv: "Författaren vars bok jag läste är colombiansk.", en: "The author whose book I read is Colombian." },
          { es: "La mujer cuyas hijas conoces vive aquí.", sv: "Kvinnan vars döttrar du känner bor här.", en: "The woman whose daughters you know lives here." },
        ],
        tip: {
          sv: "'Cuyo' böjs efter det ägda: cuyo libro (mask.), cuya casa (fem.), cuyos libros (mask. pl.), cuyas casas (fem. pl.).",
          en: "'Cuyo' agrees with the possessed noun: cuyo libro (masc.), cuya casa (fem.), cuyos libros (masc. pl.), cuyas casas (fem. pl.)."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "El hombre ___ vimos es mi profesor.", en: "The man ___ we saw is my teacher." }, answer: "que", options: ["que", "quien", "cuyo", "donde"], hint: { sv: "Direkt relativpronomen = que", en: "Direct relative pronoun = que" } },
      { type: "fill-blank", question: { sv: "La persona con ___ hablé es doctora.", en: "The person with ___ I spoke is a doctor." }, prompt: "La persona con ___ hablé es doctora.", answer: "quien", hint: { sv: "Preposition + person = quien", en: "Preposition + person = quien" } },
      { type: "fill-blank", question: { sv: "Fyll i: El autor ___ libro leí es colombiano. (vars)", en: "Fill in: The author ___ book I read is Colombian. (whose)" }, prompt: "El autor ___ libro leí es colombiano.", answer: "cuyo", hint: { sv: "Vars + mask. sing. = cuyo", en: "Whose + masc. sing. = cuyo" } },
      { type: "error-correction", question: { sv: "Rätta felet", en: "Correct the error" }, incorrectSentence: "La mujer cuyo hijas conoces.", answer: "La mujer cuyas hijas conoces.", hint: { sv: "Hijas (fem. pl.) → cuyas", en: "Hijas (fem. pl.) → cuyas" } },
    ]
  },

  // 2. Discourse connectors
  {
    id: "discourse-connectors",
    title: { sv: "Diskursmarkörer och konnektorer", en: "Discourse markers and connectors" },
    level: "C1",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Att strukturera text och tal", en: "Structuring text and speech" },
        explanation: {
          sv: "Konnektorer gör ditt tal och skrivande mer sammanhängande och akademiskt. Viktiga grupper: addition (además, también, asimismo), kontrast (sin embargo, no obstante, aunque, a pesar de), orsak (puesto que, dado que, ya que), följd (por lo tanto, por consiguiente, de ahí que).",
          en: "Connectors make your speech and writing more cohesive and academic. Important groups: addition (además, también, asimismo), contrast (sin embargo, no obstante, aunque, a pesar de), cause (puesto que, dado que, ya que), consequence (por lo tanto, por consiguiente, de ahí que)."
        },
        examples: [
          { es: "Sin embargo, no todos están de acuerdo.", sv: "Dock är inte alla överens.", en: "However, not everyone agrees." },
          { es: "Puesto que llovía, nos quedamos en casa.", sv: "Eftersom det regnade stannade vi hemma.", en: "Since it was raining, we stayed at home." },
          { es: "Por lo tanto, debemos actuar ahora.", sv: "Därför måste vi agera nu.", en: "Therefore, we must act now." },
        ],
        tip: {
          sv: "'De ahí que' kräver konjunktiv! 'De ahí que sea importante...'",
          en: "'De ahí que' requires subjunctive! 'De ahí que sea importante...'"
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "___, no todos están de acuerdo. (dock)", en: "___, not everyone agrees. (however)" }, answer: "Sin embargo", options: ["Sin embargo", "Además", "Puesto que", "Por lo tanto"], hint: { sv: "Dock/Emellertid = Sin embargo", en: "However = Sin embargo" } },
      { type: "fill-blank", question: { sv: "Fyll i: ___ llovía, nos quedamos en casa. (eftersom)", en: "Fill in: ___ it was raining, we stayed at home. (since)" }, prompt: "___ llovía, nos quedamos en casa.", answer: "Puesto que", hint: { sv: "Eftersom = Puesto que", en: "Since = Puesto que" } },
      { type: "fill-blank", question: { sv: "Fyll i: ___, debemos actuar ahora. (därför)", en: "Fill in: ___, we must act now. (therefore)" }, prompt: "___, debemos actuar ahora.", answer: "Por lo tanto", hint: { sv: "Därför = Por lo tanto", en: "Therefore = Por lo tanto" } },
      { type: "translate", question: { sv: "Översätt: Dock är inte alla överens.", en: "Translate: However, not everyone agrees." }, answer: "Sin embargo, no todos están de acuerdo.", hint: { sv: "Sin embargo = dock/emellertid", en: "Sin embargo = however" } },
    ]
  },

  // 3. Advanced subjunctive uses
  {
    id: "subjunctive-concessive",
    title: { sv: "Konjunktiv i koncessiva satser", en: "Subjunctive in concessive clauses" },
    level: "C1",
    category: "verbs",
    sections: [
      {
        heading: { sv: "Aunque + konjunktiv vs indikativ", en: "Aunque + subjunctive vs indicative" },
        explanation: {
          sv: "'Aunque' + indikativ = fakta ('Aunque llueve, salgo' – det regnar faktiskt). 'Aunque' + konjunktiv = hypotetiskt ('Aunque llueva, saldré' – om det regnar, kanske). Samma struktur gäller 'a pesar de que'.",
          en: "'Aunque' + indicative = fact ('Aunque llueve, salgo' – it actually rains). 'Aunque' + subjunctive = hypothetical ('Aunque llueva, saldré' – if it rains, maybe). Same structure applies to 'a pesar de que'."
        },
        examples: [
          { es: "Aunque está lloviendo, voy a salir. (fakta)", sv: "Även om det regnar, ska jag gå ut. (fakta)", en: "Even though it's raining, I'll go out. (fact)" },
          { es: "Aunque esté lloviendo, saldré. (hypotetiskt)", sv: "Även om det regnar, går jag ut. (hypotetiskt)", en: "Even if it's raining, I'll go out. (hypothetical)" },
        ],
        tip: {
          sv: "Fakta → indikativ. Okänt/hypotetiskt → konjunktiv. Det gäller inte bara 'aunque' utan även 'por mucho que', 'por más que'.",
          en: "Fact → indicative. Unknown/hypothetical → subjunctive. This applies not only to 'aunque' but also 'por mucho que', 'por más que'."
        }
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Aunque ___ lloviendo, salgo. (fakta – regnar nu)", en: "Even though it ___ raining, I'm going out. (fact)" }, answer: "está", options: ["está", "esté", "sea", "fuera"], hint: { sv: "Fakta = indikativ → está", en: "Fact = indicative → está" } },
      { type: "multiple-choice", question: { sv: "Aunque ___ lloviendo, saldré. (hypotetiskt)", en: "Even if it ___ raining, I'll go out. (hypothetical)" }, answer: "esté", options: ["está", "esté", "sea", "fuera"], hint: { sv: "Hypotetiskt = konjunktiv → esté", en: "Hypothetical = subjunctive → esté" } },
      { type: "translate", question: { sv: "Översätt: Även om det regnar, ska jag gå ut. (hypotetiskt)", en: "Translate: Even if it rains, I'll go out. (hypothetical)" }, answer: "Aunque llueva, saldré.", hint: { sv: "Hypotetiskt: aunque + konjunktiv", en: "Hypothetical: aunque + subjunctive" } },
    ]
  },

  // ═══════════════════════════════════════════
  // C2 – MASTERY
  // ═══════════════════════════════════════════

  // 1. Nuanced register and style
  {
    id: "register-style",
    title: { sv: "Register och stilnivåer", en: "Register and style levels" },
    level: "C2",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Formellt vs informellt register", en: "Formal vs informal register" },
        explanation: {
          sv: "Spanska har tydliga registerskillnader. Formellt: 'usted' istället för 'tú', konjunktiv mer frekvent, längre konnektorer (no obstante, asimismo). Informellt: direktare, kortare meningar, talspråk (bueno, pues, o sea).",
          en: "Spanish has clear register differences. Formal: 'usted' instead of 'tú', more frequent subjunctive, longer connectors (no obstante, asimismo). Informal: more direct, shorter sentences, colloquialisms (bueno, pues, o sea)."
        },
        examples: [
          { es: "Le agradecería que me enviara la información. (formellt)", sv: "Jag skulle uppskatta om ni skickade mig informationen. (formellt)", en: "I would appreciate if you sent me the information. (formal)" },
          { es: "¿Me mandas eso? (informellt)", sv: "Skickar du det till mig? (informellt)", en: "Can you send me that? (informal)" },
          { es: "Cabe destacar que... (akademiskt)", sv: "Det bör framhållas att... (akademiskt)", en: "It should be noted that... (academic)" },
        ],
        tip: {
          sv: "I akademiska texter används ofta opersonliga konstruktioner: 'Se considera que...', 'Es preciso señalar que...', 'Conviene recordar que...'.",
          en: "In academic texts, impersonal constructions are often used: 'Se considera que...', 'Es preciso señalar que...', 'Conviene recordar que...'."
        }
      },
      {
        heading: { sv: "Litterärt och retoriskt språk", en: "Literary and rhetorical language" },
        explanation: {
          sv: "I litterärt språk används invertering (subjekt efter verb), konjunktiv futurum (nästan utdött: 'Si así lo hiciere...'), och stilistiska konstruktioner som hyperbaton och anastrophe.",
          en: "In literary language, inversion (subject after verb), future subjunctive (nearly extinct: 'Si así lo hiciere...'), and stylistic constructions like hyperbaton and anastrophe are used."
        },
        examples: [
          { es: "Dijo el maestro que era verdad.", sv: "Sade mästaren att det var sant.", en: "Said the master that it was true." },
          { es: "Sea lo que fuere, continuaremos.", sv: "Hur det än må vara, fortsätter vi.", en: "Whatever it may be, we will continue." },
        ]
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Vilken mening är formellt register?", en: "Which sentence is formal register?" }, answer: "Le agradecería que me enviara la información.", options: ["¿Me mandas eso?", "Le agradecería que me enviara la información.", "Bueno, pues mándamelo.", "Oye, ¿me lo envías?"], hint: { sv: "Konjunktiv imperfekt + usted = formellt", en: "Imperfect subjunctive + usted = formal" } },
      { type: "fill-blank", question: { sv: "Fyll i den akademiska formuleringen: ___ destacar que los resultados son positivos.", en: "Fill in the academic phrase: It should be ___ that the results are positive." }, prompt: "___ destacar que los resultados son positivos.", answer: "Cabe", hint: { sv: "Cabe destacar = Det bör framhållas", en: "Cabe destacar = It should be noted" } },
      { type: "translate", question: { sv: "Översätt formellt: Jag skulle uppskatta om ni skickade informationen.", en: "Translate formally: I would appreciate it if you sent the information." }, answer: "Le agradecería que me enviara la información.", hint: { sv: "Agradecería + konj. imperfekt", en: "Agradecería + imp. subjunctive" } },
    ]
  },

  // 2. Exceptions and subtle distinctions
  {
    id: "subtle-distinctions",
    title: { sv: "Subtila distinktioner och undantag", en: "Subtle distinctions and exceptions" },
    level: "C2",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Ser vs Estar med adjektiv – betydelseskillnad", en: "Ser vs Estar with adjectives – meaning change" },
        explanation: {
          sv: "Vissa adjektiv ändrar betydelse helt beroende på om de används med ser eller estar. Detta är en av de mest subtila aspekterna av spansk grammatik.",
          en: "Some adjectives change meaning completely depending on whether they're used with ser or estar. This is one of the most subtle aspects of Spanish grammar."
        },
        examples: [
          { es: "Es listo. (intelligent) / Está listo. (klar/redo)", sv: "Han är intelligent. / Han är klar.", en: "He is clever. / He is ready." },
          { es: "Es aburrido. (tråkig person) / Está aburrido. (uttråkad)", sv: "Han är tråkig. / Han är uttråkad.", en: "He is boring. / He is bored." },
          { es: "Es malo. (ond/dålig) / Está malo. (sjuk)", sv: "Han är elak. / Han är sjuk.", en: "He is bad/evil. / He is sick." },
          { es: "Es verde. (grön färg) / Está verde. (omogen)", sv: "Det är grönt. / Det är omoget.", en: "It is green. / It is unripe." },
        ],
        tip: {
          sv: "Fler par: orgulloso (stolt person SER vs stolt just nu ESTAR), vivo (smart SER vs levande ESTAR), seguro (säker/trygg SER vs säker/övertygad ESTAR).",
          en: "More pairs: orgulloso (proud person SER vs proud right now ESTAR), vivo (smart SER vs alive ESTAR), seguro (safe SER vs sure/certain ESTAR)."
        }
      },
      {
        heading: { sv: "Subjuntivo futuro", en: "Future subjunctive" },
        explanation: {
          sv: "Konjunktiv futurum (hablare, comiere, viviere) är nästan utdött i talat språk men lever kvar i juridiska texter, ordspråk och några fasta uttryck. Bildas som konj. imperfekt men med -re istället för -ra.",
          en: "The future subjunctive (hablare, comiere, viviere) is nearly extinct in spoken language but survives in legal texts, proverbs, and fixed expressions. Formed like imperfect subjunctive but with -re instead of -ra."
        },
        examples: [
          { es: "Donde fueres, haz lo que vieres.", sv: "I Rom, gör som romarna.", en: "When in Rome, do as the Romans do." },
          { es: "Sea lo que fuere.", sv: "Hur det än må vara.", en: "Whatever it may be." },
        ]
      }
    ],
    exercises: [
      { type: "multiple-choice", question: { sv: "Él ___ listo. (intelligent, permanent)", en: "He ___ clever. (intelligent, permanent)" }, answer: "es", options: ["es", "está", "fue", "estuvo"], hint: { sv: "Permanent egenskap = ser", en: "Permanent trait = ser" } },
      { type: "multiple-choice", question: { sv: "Él ___ listo. (redo, tillfälligt)", en: "He ___ ready. (temporary)" }, answer: "está", options: ["es", "está", "fue", "estuvo"], hint: { sv: "Tillfälligt tillstånd = estar", en: "Temporary state = estar" } },
      { type: "fill-blank", question: { sv: "Fyll i: La fruta ___ verde. (omogen)", en: "Fill in: The fruit ___ unripe." }, prompt: "La fruta ___ verde.", answer: "está", hint: { sv: "Omogen (tillfälligt) = estar", en: "Unripe (temporary) = estar" } },
      { type: "translate", question: { sv: "Översätt: Han är tråkig (som person).", en: "Translate: He is boring (as a person)." }, answer: "Es aburrido.", hint: { sv: "Permanent egenskap = ser", en: "Permanent trait = ser" } },
    ]
  },

  // 3. Advanced writing structures
  {
    id: "advanced-sentence-structures",
    title: { sv: "Avancerade meningsstrukturer", en: "Advanced sentence structures" },
    level: "C2",
    category: "grammar",
    sections: [
      {
        heading: { sv: "Nominaliseringar och abstrakta konstruktioner", en: "Nominalizations and abstract constructions" },
        explanation: {
          sv: "I avancerad spanska omvandlas verb och adjektiv till substantiv: 'El haber estudiado me ayudó' (Att ha pluggat hjälpte mig). Artikeln 'lo' + adjektiv skapar abstrakta begrepp: 'lo importante' (det viktiga), 'lo bueno' (det goda).",
          en: "In advanced Spanish, verbs and adjectives become nouns: 'El haber estudiado me ayudó' (Having studied helped me). Article 'lo' + adjective creates abstract concepts: 'lo importante' (the important thing), 'lo bueno' (the good thing)."
        },
        examples: [
          { es: "Lo importante es participar.", sv: "Det viktiga är att delta.", en: "The important thing is to participate." },
          { es: "Lo bueno de vivir aquí es el clima.", sv: "Det bra med att bo här är klimatet.", en: "The good thing about living here is the climate." },
          { es: "El haber viajado tanto me ha enriquecido.", sv: "Att ha rest så mycket har berikat mig.", en: "Having traveled so much has enriched me." },
        ]
      },
      {
        heading: { sv: "Retorisk emfas", en: "Rhetorical emphasis" },
        explanation: {
          sv: "Spanska har flera sätt att betona: 'Lo que' + verb + 'es/fue' (Det som... är/var): 'Lo que me molesta es su actitud'. 'Sí que' för emfatisk bekräftelse: 'Sí que lo sé' (Jag VET det visst).",
          en: "Spanish has several ways to emphasize: 'Lo que' + verb + 'es/fue' (What... is/was): 'Lo que me molesta es su actitud'. 'Sí que' for emphatic confirmation: 'Sí que lo sé' (I DO know it)."
        },
        examples: [
          { es: "Lo que me molesta es su actitud.", sv: "Det som stör mig är hans attityd.", en: "What bothers me is his attitude." },
          { es: "Sí que lo sé.", sv: "Jo, jag vet det visst.", en: "I DO know it." },
        ]
      }
    ],
    exercises: [
      { type: "fill-blank", question: { sv: "Fyll i: ___ importante es participar. (det)", en: "Fill in: The important thing ___ to participate." }, prompt: "___ importante es participar.", answer: "Lo", hint: { sv: "Lo + adjektiv = abstrakt begrepp", en: "Lo + adjective = abstract concept" } },
      { type: "multiple-choice", question: { sv: "___ me molesta es su actitud. (det som)", en: "___ bothers me is his attitude. (what)" }, answer: "Lo que", options: ["Lo que", "El que", "Que", "Qué"], hint: { sv: "Det som = Lo que", en: "What (relative) = Lo que" } },
      { type: "translate", question: { sv: "Översätt: Det bra med att bo här är klimatet.", en: "Translate: The good thing about living here is the climate." }, answer: "Lo bueno de vivir aquí es el clima.", hint: { sv: "Lo bueno + de + infinitiv", en: "Lo bueno + de + infinitive" } },
    ]
  },
];
