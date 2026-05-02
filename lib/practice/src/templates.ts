/**
 * Murciélingo template-based practice generator
 * ----------------------------------------------
 * Rule-based generator that produces large amounts of safe, predictable
 * A1/A2 practice items by combining templates with variable banks. Runs
 * locally in shared app logic (no AI, no network) so both the web app
 * and the React Native mobile app can use it identically.
 *
 * Generated items carry `source: "template"` so the practice engine can
 * tell them apart from curated items, and they come back in the same
 * `PracticeItem` shape so they slot straight into `buildPracticeSession`.
 */

import type { Level, PracticeItem, SkillCategory } from "./index";

// ───────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────

export type TemplateFormat =
  | "translate"
  | "mcq"
  | "fill"
  | "sentence"
  | "phrase"
  | "scenario";

export type BilingualText = { en: string; sv: string };

export interface VariableBankEntry {
  /** Used in id generation. */
  id: string;
  [field: string]: string | undefined;
}

export interface VariableBank {
  id: string;
  entries: VariableBankEntry[];
}

export interface PracticeTemplate {
  id: string;
  level: Level;
  skill: SkillCategory;
  /** Finer-grained category, e.g. "noun_gender", "verb_present", "cafe". */
  subskill: string;
  /**
   * Prompt text. Placeholders use `{var}` or `{var.field}` syntax. If the
   * field is omitted, the bank entry's primary surface field is used
   * (`es` if present, otherwise `id`).
   */
  promptTemplate: BilingualText;
  /** Same placeholder syntax as `promptTemplate`. */
  answerTemplate: string;
  /**
   * Map of variable name (used in placeholders) to the id of the
   * variable bank to draw from.
   */
  variables: Record<string, string>;
  /**
   * Optional alternative answers (each a template string). Used by the
   * runner's accepted-answer matching for free-text items.
   */
  acceptedAnswers?: string[];
  explanation?: BilingualText;
  difficulty: 1 | 2 | 3;
  /** How the renderer should treat the generated item. */
  format: TemplateFormat;
  /** Hard-coded MCQ options. Overrides `distractors` if both are set. */
  staticOptions?: string[];
  /** Sample distractors from a bank field (excluding the correct answer). */
  distractors?: { bank: string; field: string; count: number };
}

export interface GeneratedPracticeItem {
  id: string;
  templateId: string;
  source: "template";
  level: Level;
  skill: SkillCategory;
  category: string;
  difficulty: 1 | 2 | 3;
  format: TemplateFormat;
  prompt: BilingualText;
  answer: string;
  acceptedAnswers: string[];
  options?: string[];
  explanation?: BilingualText;
}

export interface GenerateOptions {
  templates?: ReadonlyArray<PracticeTemplate>;
  banks?: Readonly<Record<string, VariableBank>>;
  /** Maximum variants produced per template. Default 6. */
  maxPerTemplate?: number;
  /** Hard cap on total generated items. Default 200. */
  maxTotal?: number;
  /** Only generate items at or below this CEFR level. */
  upToLevel?: Level;
  /** Restrict generation to a subset of levels. */
  levels?: ReadonlyArray<Level>;
  /** Inject for deterministic tests. */
  random?: () => number;
  /**
   * Item ids that have already been used in the current session — the
   * generator will avoid producing duplicates of these.
   */
  excludeIds?: ReadonlySet<string>;
}

// ───────────────────────────────────────────────────────────────────
// Variable banks (A1/A2 starter content)
// ───────────────────────────────────────────────────────────────────

const NOUNS_FOOD: VariableBankEntry[] = [
  { id: "pan", es: "pan", en: "bread", sv: "bröd", gender: "m", article: "el", indef: "un", plural: "panes", pluralArt: "los" },
  { id: "manzana", es: "manzana", en: "apple", sv: "äpple", gender: "f", article: "la", indef: "una", plural: "manzanas", pluralArt: "las" },
  { id: "queso", es: "queso", en: "cheese", sv: "ost", gender: "m", article: "el", indef: "un", plural: "quesos", pluralArt: "los" },
  { id: "leche", es: "leche", en: "milk", sv: "mjölk", gender: "f", article: "la", indef: "una", plural: "leches", pluralArt: "las" },
  { id: "agua", es: "agua", en: "water", sv: "vatten", gender: "f", article: "el", indef: "un", plural: "aguas", pluralArt: "las" },
  { id: "café", es: "café", en: "coffee", sv: "kaffe", gender: "m", article: "el", indef: "un", plural: "cafés", pluralArt: "los" },
  { id: "té", es: "té", en: "tea", sv: "te", gender: "m", article: "el", indef: "un", plural: "tés", pluralArt: "los" },
  { id: "huevo", es: "huevo", en: "egg", sv: "ägg", gender: "m", article: "el", indef: "un", plural: "huevos", pluralArt: "los" },
  { id: "pollo", es: "pollo", en: "chicken", sv: "kyckling", gender: "m", article: "el", indef: "un", plural: "pollos", pluralArt: "los" },
  { id: "ensalada", es: "ensalada", en: "salad", sv: "sallad", gender: "f", article: "la", indef: "una", plural: "ensaladas", pluralArt: "las" },
];

const NOUNS_HOUSE: VariableBankEntry[] = [
  { id: "libro", es: "libro", en: "book", sv: "bok", gender: "m", article: "el", indef: "un", plural: "libros", pluralArt: "los" },
  { id: "mesa", es: "mesa", en: "table", sv: "bord", gender: "f", article: "la", indef: "una", plural: "mesas", pluralArt: "las" },
  { id: "silla", es: "silla", en: "chair", sv: "stol", gender: "f", article: "la", indef: "una", plural: "sillas", pluralArt: "las" },
  { id: "puerta", es: "puerta", en: "door", sv: "dörr", gender: "f", article: "la", indef: "una", plural: "puertas", pluralArt: "las" },
  { id: "ventana", es: "ventana", en: "window", sv: "fönster", gender: "f", article: "la", indef: "una", plural: "ventanas", pluralArt: "las" },
  { id: "casa", es: "casa", en: "house", sv: "hus", gender: "f", article: "la", indef: "una", plural: "casas", pluralArt: "las" },
  { id: "perro", es: "perro", en: "dog", sv: "hund", gender: "m", article: "el", indef: "un", plural: "perros", pluralArt: "los" },
  { id: "gato", es: "gato", en: "cat", sv: "katt", gender: "m", article: "el", indef: "un", plural: "gatos", pluralArt: "los" },
  { id: "coche", es: "coche", en: "car", sv: "bil", gender: "m", article: "el", indef: "un", plural: "coches", pluralArt: "los" },
  { id: "teléfono", es: "teléfono", en: "phone", sv: "telefon", gender: "m", article: "el", indef: "un", plural: "teléfonos", pluralArt: "los" },
];

const PLACES: VariableBankEntry[] = [
  { id: "baño", es: "baño", en: "bathroom", sv: "toalett", article: "el" },
  { id: "estación", es: "estación", en: "station", sv: "station", article: "la" },
  { id: "hotel", es: "hotel", en: "hotel", sv: "hotell", article: "el" },
  { id: "supermercado", es: "supermercado", en: "supermarket", sv: "stormarknad", article: "el" },
  { id: "farmacia", es: "farmacia", en: "pharmacy", sv: "apotek", article: "la" },
  { id: "playa", es: "playa", en: "beach", sv: "strand", article: "la" },
  { id: "museo", es: "museo", en: "museum", sv: "museum", article: "el" },
  { id: "restaurante", es: "restaurante", en: "restaurant", sv: "restaurang", article: "el" },
];

const GREETINGS: VariableBankEntry[] = [
  { id: "hola", es: "hola", en: "hello", sv: "hej" },
  { id: "buenos_dias", es: "buenos días", en: "good morning", sv: "god morgon" },
  { id: "buenas_tardes", es: "buenas tardes", en: "good afternoon", sv: "god eftermiddag" },
  { id: "buenas_noches", es: "buenas noches", en: "good night", sv: "god natt" },
  { id: "adios", es: "adiós", en: "goodbye", sv: "hej då" },
  { id: "hasta_luego", es: "hasta luego", en: "see you later", sv: "vi ses senare" },
  { id: "gracias", es: "gracias", en: "thank you", sv: "tack" },
  { id: "por_favor", es: "por favor", en: "please", sv: "snälla" },
];

// Verb bank with present-tense "yo / tú / él" forms.
const VERBS_REGULAR: VariableBankEntry[] = [
  { id: "hablar", es: "hablar", en: "to speak", sv: "att tala", yo: "hablo", tu: "hablas", el: "habla", nosotros: "hablamos", ellos: "hablan" },
  { id: "comer", es: "comer", en: "to eat", sv: "att äta", yo: "como", tu: "comes", el: "come", nosotros: "comemos", ellos: "comen" },
  { id: "vivir", es: "vivir", en: "to live", sv: "att bo", yo: "vivo", tu: "vives", el: "vive", nosotros: "vivimos", ellos: "viven" },
  { id: "trabajar", es: "trabajar", en: "to work", sv: "att arbeta", yo: "trabajo", tu: "trabajas", el: "trabaja", nosotros: "trabajamos", ellos: "trabajan" },
  { id: "estudiar", es: "estudiar", en: "to study", sv: "att studera", yo: "estudio", tu: "estudias", el: "estudia", nosotros: "estudiamos", ellos: "estudian" },
  { id: "beber", es: "beber", en: "to drink", sv: "att dricka", yo: "bebo", tu: "bebes", el: "bebe", nosotros: "bebemos", ellos: "beben" },
  { id: "escribir", es: "escribir", en: "to write", sv: "att skriva", yo: "escribo", tu: "escribes", el: "escribe", nosotros: "escribimos", ellos: "escriben" },
  { id: "aprender", es: "aprender", en: "to learn", sv: "att lära sig", yo: "aprendo", tu: "aprendes", el: "aprende", nosotros: "aprendemos", ellos: "aprenden" },
];

const PRONOUNS: VariableBankEntry[] = [
  { id: "yo", es: "yo", en: "I", sv: "jag", form: "yo" },
  { id: "tu", es: "tú", en: "you", sv: "du", form: "tu" },
  { id: "el", es: "él", en: "he", sv: "han", form: "el" },
  { id: "nosotros", es: "nosotros", en: "we", sv: "vi", form: "nosotros" },
  { id: "ellos", es: "ellos", en: "they", sv: "de", form: "ellos" },
];

const DAILY_PHRASES: VariableBankEntry[] = [
  {
    id: "where_bathroom",
    en: "Where is the bathroom?",
    sv: "Var ligger toaletten?",
    es: "¿Dónde está el baño?",
  },
  {
    id: "how_much",
    en: "How much does it cost?",
    sv: "Hur mycket kostar det?",
    es: "¿Cuánto cuesta?",
  },
  {
    id: "menu_please",
    en: "The menu, please.",
    sv: "Menyn, tack.",
    es: "La carta, por favor.",
  },
  {
    id: "bill_please",
    en: "The bill, please.",
    sv: "Notan, tack.",
    es: "La cuenta, por favor.",
  },
  {
    id: "speak_english",
    en: "Do you speak English?",
    sv: "Talar du engelska?",
    es: "¿Hablas inglés?",
  },
  {
    id: "dont_understand",
    en: "I don't understand.",
    sv: "Jag förstår inte.",
    es: "No entiendo.",
  },
  {
    id: "my_name_is",
    en: "My name is Ana.",
    sv: "Jag heter Ana.",
    es: "Me llamo Ana.",
  },
  {
    id: "nice_to_meet",
    en: "Nice to meet you.",
    sv: "Trevligt att träffas.",
    es: "Mucho gusto.",
  },
  {
    id: "im_from",
    en: "I'm from Sweden.",
    sv: "Jag är från Sverige.",
    es: "Soy de Suecia.",
  },
  {
    id: "i_want",
    en: "I want a coffee.",
    sv: "Jag vill ha en kaffe.",
    es: "Quiero un café.",
  },
];

const SCENARIOS: VariableBankEntry[] = [
  {
    id: "cafe_coffee_milk",
    en: "You are in a café. Ask for a coffee with milk.",
    sv: "Du är på ett kafé. Be om en kaffe med mjölk.",
    es: "Un café con leche, por favor.",
  },
  {
    id: "cafe_water",
    en: "You are at a café. Ask for a glass of water.",
    sv: "Du är på ett kafé. Be om ett glas vatten.",
    es: "Un vaso de agua, por favor.",
  },
  {
    id: "rest_table_two",
    en: "You arrive at a restaurant. Ask for a table for two.",
    sv: "Du kommer till en restaurang. Be om ett bord för två.",
    es: "Una mesa para dos, por favor.",
  },
  {
    id: "rest_bill",
    en: "You finished eating. Ask for the bill.",
    sv: "Du har ätit klart. Be om notan.",
    es: "La cuenta, por favor.",
  },
  {
    id: "directions_station",
    en: "You are lost. Ask where the train station is.",
    sv: "Du har gått vilse. Fråga var tågstationen ligger.",
    es: "¿Dónde está la estación?",
  },
  {
    id: "shop_size",
    en: "You are shopping for clothes. Ask if they have a smaller size.",
    sv: "Du handlar kläder. Fråga om de har en mindre storlek.",
    es: "¿Tienen una talla más pequeña?",
  },
  {
    id: "travel_ticket",
    en: "You are at the station. Ask for a ticket to Madrid.",
    sv: "Du är på stationen. Be om en biljett till Madrid.",
    es: "Un billete para Madrid, por favor.",
  },
  {
    id: "small_talk_weather",
    en: "Make small talk about the weather: say it's hot today.",
    sv: "Småprata om vädret: säg att det är varmt idag.",
    es: "Hace calor hoy.",
  },
  {
    id: "routine_morning",
    en: "Describe your routine: I get up at seven.",
    sv: "Beskriv din rutin: Jag går upp klockan sju.",
    es: "Me levanto a las siete.",
  },
  {
    id: "routine_breakfast",
    en: "Describe your routine: I eat breakfast at home.",
    sv: "Beskriv din rutin: Jag äter frukost hemma.",
    es: "Desayuno en casa.",
  },
];

export const BUILTIN_BANKS: Record<string, VariableBank> = {
  nouns_food: { id: "nouns_food", entries: NOUNS_FOOD },
  nouns_house: { id: "nouns_house", entries: NOUNS_HOUSE },
  nouns_all: { id: "nouns_all", entries: [...NOUNS_FOOD, ...NOUNS_HOUSE] },
  places: { id: "places", entries: PLACES },
  greetings: { id: "greetings", entries: GREETINGS },
  verbs_regular: { id: "verbs_regular", entries: VERBS_REGULAR },
  pronouns: { id: "pronouns", entries: PRONOUNS },
  daily_phrases: { id: "daily_phrases", entries: DAILY_PHRASES },
  scenarios: { id: "scenarios", entries: SCENARIOS },
};

// ───────────────────────────────────────────────────────────────────
// Built-in templates (A1/A2)
// ───────────────────────────────────────────────────────────────────

export const BUILTIN_TEMPLATES: PracticeTemplate[] = [
  // 1. Vocabulary translation (food)
  {
    id: "vocab_translate_food",
    level: "A1",
    skill: "vocabulary",
    subskill: "food_drink",
    promptTemplate: {
      en: "Translate to Spanish: {noun.en}",
      sv: "Översätt till spanska: {noun.sv}",
    },
    answerTemplate: "{noun.es}",
    variables: { noun: "nouns_food" },
    difficulty: 1,
    format: "translate",
  },
  // Vocabulary translation (house/objects)
  {
    id: "vocab_translate_house",
    level: "A1",
    skill: "vocabulary",
    subskill: "household",
    promptTemplate: {
      en: "Translate to Spanish: {noun.en}",
      sv: "Översätt till spanska: {noun.sv}",
    },
    answerTemplate: "{noun.es}",
    variables: { noun: "nouns_house" },
    difficulty: 1,
    format: "translate",
  },

  // 2. Noun gender — choose the correct definite article
  {
    id: "gender_definite_article",
    level: "A1",
    skill: "grammar",
    subskill: "noun_gender",
    promptTemplate: {
      en: "Choose the correct article for {noun.es}",
      sv: "Välj rätt artikel för {noun.es}",
    },
    answerTemplate: "{noun.article}",
    variables: { noun: "nouns_all" },
    staticOptions: ["el", "la", "los", "las"],
    explanation: {
      en: "Most nouns ending in -o are masculine (el); most ending in -a are feminine (la).",
      sv: "De flesta substantiv på -o är maskulina (el); de flesta på -a är feminina (la).",
    },
    difficulty: 1,
    format: "mcq",
  },
  // Noun gender — indefinite article (un / una)
  {
    id: "gender_indefinite_article",
    level: "A1",
    skill: "grammar",
    subskill: "noun_gender",
    promptTemplate: {
      en: "Choose the correct indefinite article: ___ {noun.es}",
      sv: "Välj rätt obestämd artikel: ___ {noun.es}",
    },
    answerTemplate: "{noun.indef}",
    variables: { noun: "nouns_all" },
    staticOptions: ["un", "una"],
    difficulty: 1,
    format: "mcq",
  },

  // 3. Plural forms
  {
    id: "plural_forms",
    level: "A1",
    skill: "grammar",
    subskill: "plurals",
    promptTemplate: {
      en: "Make this plural: {noun.article} {noun.es}",
      sv: "Sätt i plural: {noun.article} {noun.es}",
    },
    answerTemplate: "{noun.pluralArt} {noun.plural}",
    variables: { noun: "nouns_all" },
    explanation: {
      en: "Add -s after a vowel, -es after a consonant, and change the article to los/las.",
      sv: "Lägg till -s efter vokal, -es efter konsonant, och ändra artikeln till los/las.",
    },
    difficulty: 2,
    format: "fill",
  },

  // 4. Verb conjugation (present, regular)
  {
    id: "verb_conjugate_present",
    level: "A1",
    skill: "grammar",
    subskill: "verb_present",
    promptTemplate: {
      en: "Conjugate {verb.es} for {pronoun.es}",
      sv: "Böj {verb.es} för {pronoun.es}",
    },
    answerTemplate: "{verb.{pronoun.form}}",
    variables: { verb: "verbs_regular", pronoun: "pronouns" },
    difficulty: 2,
    format: "fill",
  },

  // 5. Sentence building / translation
  {
    id: "sentence_i_want_noun",
    level: "A1",
    skill: "sentences",
    subskill: "expressing_wants",
    promptTemplate: {
      en: "Build the sentence: I want a {noun.en}",
      sv: "Bygg meningen: Jag vill ha en {noun.sv}",
    },
    answerTemplate: "Quiero {noun.indef} {noun.es}",
    variables: { noun: "nouns_food" },
    difficulty: 2,
    format: "sentence",
  },
  {
    id: "sentence_i_eat_noun",
    level: "A2",
    skill: "sentences",
    subskill: "describing_actions",
    promptTemplate: {
      en: "Build the sentence: I eat {noun.en}",
      sv: "Bygg meningen: Jag äter {noun.en}",
    },
    answerTemplate: "Como {noun.es}",
    variables: { noun: "nouns_food" },
    difficulty: 2,
    format: "sentence",
  },

  // 6. Daily phrase variations
  {
    id: "daily_phrase",
    level: "A1",
    skill: "sentences",
    subskill: "daily_phrases",
    promptTemplate: {
      en: "How do you say: {phrase.en}",
      sv: "Hur säger man: {phrase.sv}",
    },
    answerTemplate: "{phrase.es}",
    variables: { phrase: "daily_phrases" },
    difficulty: 2,
    format: "phrase",
  },

  // 7. Scenario prompts
  {
    id: "scenario_prompt",
    level: "A2",
    skill: "sentences",
    subskill: "scenarios",
    promptTemplate: {
      en: "{scenario.en}",
      sv: "{scenario.sv}",
    },
    answerTemplate: "{scenario.es}",
    variables: { scenario: "scenarios" },
    difficulty: 2,
    format: "scenario",
  },
];

// ───────────────────────────────────────────────────────────────────
// Generator
// ───────────────────────────────────────────────────────────────────

const LEVEL_RANK: Record<Level, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 5,
};

/** Look up `entry[field]`, falling back to `es` then `id`. */
function readField(entry: VariableBankEntry, field?: string): string {
  if (field && typeof entry[field] === "string") return entry[field] as string;
  if (typeof entry.es === "string") return entry.es;
  return entry.id;
}

/**
 * Substitute `{var}` and `{var.field}` placeholders in `text` using
 * `assignments` (var name → bank entry). Supports a single nested level
 * `{var.{other.form}}` for cases like verb conjugation by pronoun.
 */
function substitute(
  text: string,
  assignments: Record<string, VariableBankEntry>,
): string {
  // First resolve nested placeholders one pass at a time.
  let prev = text;
  for (let i = 0; i < 3; i++) {
    const next = prev.replace(/\{(\w+)\.\{(\w+)\.(\w+)\}\}/g, (_m, outer, inner, innerField) => {
      const innerEntry = assignments[inner];
      if (!innerEntry) return _m;
      const dynField = readField(innerEntry, innerField);
      const outerEntry = assignments[outer];
      if (!outerEntry) return _m;
      return readField(outerEntry, dynField);
    });
    if (next === prev) break;
    prev = next;
  }
  // Then resolve simple `{var}` and `{var.field}` placeholders.
  return prev.replace(/\{(\w+)(?:\.(\w+))?\}/g, (_m, name: string, field?: string) => {
    const entry = assignments[name];
    if (!entry) return _m;
    return readField(entry, field);
  });
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Produce up to `maxCombinations` distinct variable assignments for a
 * template, sampling from each variable's bank. Uses a randomised
 * cartesian walk so different sessions get different items.
 */
function sampleAssignments(
  template: PracticeTemplate,
  banks: Record<string, VariableBank>,
  maxCombinations: number,
  rng: () => number,
): Record<string, VariableBankEntry>[] {
  const varNames = Object.keys(template.variables);
  const pools: VariableBankEntry[][] = varNames.map((name) => {
    const bankId = template.variables[name];
    const bank = banks[bankId];
    if (!bank) return [];
    return shuffle(bank.entries, rng);
  });
  if (pools.some((p) => p.length === 0)) return [];

  const results: Record<string, VariableBankEntry>[] = [];
  const seen = new Set<string>();

  // Walk pools in interleaved fashion: pick the i-th from each, then mix.
  const rounds = Math.max(...pools.map((p) => p.length));
  outer: for (let i = 0; i < rounds * 2; i++) {
    for (let j = 0; j < pools.length; j++) {
      const assignment: Record<string, VariableBankEntry> = {};
      for (let k = 0; k < varNames.length; k++) {
        const pool = pools[k];
        const idx = (i + j * 2 + k) % pool.length;
        assignment[varNames[k]] = pool[idx];
      }
      const key = varNames.map((n) => assignment[n].id).join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(assignment);
      if (results.length >= maxCombinations) break outer;
    }
  }
  return results;
}

function buildOptions(
  template: PracticeTemplate,
  answer: string,
  banks: Record<string, VariableBank>,
  rng: () => number,
): string[] | undefined {
  if (template.staticOptions) {
    const opts = template.staticOptions.slice();
    if (!opts.includes(answer)) opts.push(answer);
    return shuffle(opts, rng);
  }
  if (template.distractors) {
    const bank = banks[template.distractors.bank];
    if (!bank) return undefined;
    const candidates = bank.entries
      .map((e) => readField(e, template.distractors!.field))
      .filter((v) => v && v !== answer);
    const picked = shuffle(Array.from(new Set(candidates)), rng).slice(
      0,
      template.distractors.count,
    );
    if (picked.length === 0) return undefined;
    return shuffle([answer, ...picked], rng);
  }
  return undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
}

export function generatePracticeItems(
  opts: GenerateOptions = {},
): GeneratedPracticeItem[] {
  const templates = opts.templates ?? BUILTIN_TEMPLATES;
  const banks = opts.banks ?? BUILTIN_BANKS;
  const maxPerTemplate = Math.max(1, opts.maxPerTemplate ?? 6);
  const maxTotal = Math.max(1, opts.maxTotal ?? 200);
  const rng = opts.random ?? Math.random;
  const excludeIds = opts.excludeIds ?? new Set<string>();

  const allowedLevels = (() => {
    if (opts.levels && opts.levels.length > 0) return new Set(opts.levels);
    if (opts.upToLevel) {
      const max = LEVEL_RANK[opts.upToLevel];
      return new Set(
        (Object.keys(LEVEL_RANK) as Level[]).filter((l) => LEVEL_RANK[l] <= max),
      );
    }
    return null;
  })();

  const items: GeneratedPracticeItem[] = [];
  const seenIds = new Set<string>();

  for (const template of templates) {
    if (allowedLevels && !allowedLevels.has(template.level)) continue;

    const assignments = sampleAssignments(template, banks, maxPerTemplate, rng);
    for (const assignment of assignments) {
      const promptEn = substitute(template.promptTemplate.en, assignment);
      const promptSv = substitute(template.promptTemplate.sv, assignment);
      const answer = substitute(template.answerTemplate, assignment);
      // Surface unresolved placeholders early in dev — masks template/bank mistakes.
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV !== "production" &&
        /\{\w+(?:\.\w+)?\}/.test(promptEn + " " + promptSv + " " + answer)
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `[practice-templates] unresolved placeholder in template "${template.id}":`,
          { promptEn, promptSv, answer },
        );
      }
      const accepted = (template.acceptedAnswers ?? [])
        .map((a) => substitute(a, assignment))
        .filter((a) => a && a !== answer);

      const variantKey = Object.values(assignment)
        .map((e) => e.id)
        .join("_");
      const id = `tpl_${template.id}_${slugify(variantKey)}`;
      if (seenIds.has(id) || excludeIds.has(id)) continue;
      seenIds.add(id);

      const options = buildOptions(template, answer, banks, rng);

      items.push({
        id,
        templateId: template.id,
        source: "template",
        level: template.level,
        skill: template.skill,
        category: template.subskill,
        difficulty: template.difficulty,
        format: template.format,
        prompt: { en: promptEn, sv: promptSv },
        answer,
        acceptedAnswers: accepted,
        options,
        explanation: template.explanation,
      });

      if (items.length >= maxTotal) return items;
    }
  }

  return items;
}

/**
 * Convenience: convert a `GeneratedPracticeItem` into a generic
 * `PracticeItem` whose payload is the generated item itself. Apps
 * typically wrap with their own payload adapter instead.
 */
export function toPracticeItem(
  generated: GeneratedPracticeItem,
): PracticeItem<GeneratedPracticeItem> {
  return {
    id: generated.id,
    skill: generated.skill,
    level: generated.level,
    category: generated.category,
    difficulty: generated.difficulty,
    payload: generated,
  };
}
