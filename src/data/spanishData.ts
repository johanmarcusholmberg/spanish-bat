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

export const verbs: VerbData[] = [
  {
    infinitive: "hablar", sv: "tala", en: "to speak", level: "A1",
    tenses: {
      presente: { yo: "hablo", tú: "hablas", él: "habla", nosotros: "hablamos", vosotros: "habláis", ellos: "hablan", example: { es: "Yo hablo español todos los días.", sv: "Jag talar spanska varje dag.", en: "I speak Spanish every day." } },
      preterito: { yo: "hablé", tú: "hablaste", él: "habló", nosotros: "hablamos", vosotros: "hablasteis", ellos: "hablaron", example: { es: "Ayer hablé con mi madre.", sv: "Igår talade jag med min mamma.", en: "Yesterday I spoke with my mother." } },
      futuro: { yo: "hablaré", tú: "hablarás", él: "hablará", nosotros: "hablaremos", vosotros: "hablaréis", ellos: "hablarán", example: { es: "Mañana hablaré con el profesor.", sv: "Imorgon kommer jag att tala med läraren.", en: "Tomorrow I will speak with the teacher." } },
    },
  },
  {
    infinitive: "comer", sv: "äta", en: "to eat", level: "A1",
    tenses: {
      presente: { yo: "como", tú: "comes", él: "come", nosotros: "comemos", vosotros: "coméis", ellos: "comen", example: { es: "Nosotros comemos paella los domingos.", sv: "Vi äter paella på söndagar.", en: "We eat paella on Sundays." } },
      preterito: { yo: "comí", tú: "comiste", él: "comió", nosotros: "comimos", vosotros: "comisteis", ellos: "comieron", example: { es: "Ayer comimos en un restaurante.", sv: "Igår åt vi på en restaurang.", en: "Yesterday we ate at a restaurant." } },
      futuro: { yo: "comeré", tú: "comerás", él: "comerá", nosotros: "comeremos", vosotros: "comeréis", ellos: "comerán", example: { es: "Esta noche comeremos pizza.", sv: "Ikväll kommer vi att äta pizza.", en: "Tonight we will eat pizza." } },
    },
  },
  {
    infinitive: "vivir", sv: "leva/bo", en: "to live", level: "A1",
    tenses: {
      presente: { yo: "vivo", tú: "vives", él: "vive", nosotros: "vivimos", vosotros: "vivís", ellos: "viven", example: { es: "Ellos viven en Madrid.", sv: "De bor i Madrid.", en: "They live in Madrid." } },
      preterito: { yo: "viví", tú: "viviste", él: "vivió", nosotros: "vivimos", vosotros: "vivisteis", ellos: "vivieron", example: { es: "Viví en Barcelona durante dos años.", sv: "Jag bodde i Barcelona i två år.", en: "I lived in Barcelona for two years." } },
      futuro: { yo: "viviré", tú: "vivirás", él: "vivirá", nosotros: "viviremos", vosotros: "viviréis", ellos: "vivirán", example: { es: "El próximo año viviremos en España.", sv: "Nästa år kommer vi att bo i Spanien.", en: "Next year we will live in Spain." } },
    },
  },
  {
    infinitive: "ser", sv: "vara", en: "to be", level: "A1",
    tenses: {
      presente: { yo: "soy", tú: "eres", él: "es", nosotros: "somos", vosotros: "sois", ellos: "son", example: { es: "Yo soy estudiante.", sv: "Jag är student.", en: "I am a student." } },
      preterito: { yo: "fui", tú: "fuiste", él: "fue", nosotros: "fuimos", vosotros: "fuisteis", ellos: "fueron", example: { es: "Fue un día maravilloso.", sv: "Det var en underbar dag.", en: "It was a wonderful day." } },
      futuro: { yo: "seré", tú: "serás", él: "será", nosotros: "seremos", vosotros: "seréis", ellos: "serán", example: { es: "Seré médico algún día.", sv: "Jag kommer att bli läkare en dag.", en: "I will be a doctor someday." } },
    },
  },
  {
    infinitive: "tener", sv: "ha", en: "to have", level: "A1",
    tenses: {
      presente: { yo: "tengo", tú: "tienes", él: "tiene", nosotros: "tenemos", vosotros: "tenéis", ellos: "tienen", example: { es: "Yo tengo un gato.", sv: "Jag har en katt.", en: "I have a cat." } },
      preterito: { yo: "tuve", tú: "tuviste", él: "tuvo", nosotros: "tuvimos", vosotros: "tuvisteis", ellos: "tuvieron", example: { es: "Tuve mucha suerte ayer.", sv: "Jag hade mycket tur igår.", en: "I had a lot of luck yesterday." } },
      futuro: { yo: "tendré", tú: "tendrás", él: "tendrá", nosotros: "tendremos", vosotros: "tendréis", ellos: "tendrán", example: { es: "Mañana tendré una reunión.", sv: "Imorgon kommer jag att ha ett möte.", en: "Tomorrow I will have a meeting." } },
    },
  },
  {
    infinitive: "poder", sv: "kunna", en: "to be able to", level: "A2",
    tenses: {
      presente: { yo: "puedo", tú: "puedes", él: "puede", nosotros: "podemos", vosotros: "podéis", ellos: "pueden", example: { es: "¿Puedes ayudarme?", sv: "Kan du hjälpa mig?", en: "Can you help me?" } },
      preterito: { yo: "pude", tú: "pudiste", él: "pudo", nosotros: "pudimos", vosotros: "pudisteis", ellos: "pudieron", example: { es: "No pude dormir anoche.", sv: "Jag kunde inte sova inatt.", en: "I couldn't sleep last night." } },
      futuro: { yo: "podré", tú: "podrás", él: "podrá", nosotros: "podremos", vosotros: "podréis", ellos: "podrán", example: { es: "Pronto podrás hablar español.", sv: "Snart kommer du att kunna tala spanska.", en: "Soon you will be able to speak Spanish." } },
    },
  },
  {
    infinitive: "querer", sv: "vilja", en: "to want", level: "A2",
    tenses: {
      presente: { yo: "quiero", tú: "quieres", él: "quiere", nosotros: "queremos", vosotros: "queréis", ellos: "quieren", example: { es: "Quiero un café, por favor.", sv: "Jag vill ha en kaffe, tack.", en: "I want a coffee, please." } },
      preterito: { yo: "quise", tú: "quisiste", él: "quiso", nosotros: "quisimos", vosotros: "quisisteis", ellos: "quisieron", example: { es: "Quise llamarte pero no pude.", sv: "Jag ville ringa dig men kunde inte.", en: "I wanted to call you but I couldn't." } },
      futuro: { yo: "querré", tú: "querrás", él: "querrá", nosotros: "querremos", vosotros: "querréis", ellos: "querrán", example: { es: "Querrás volver a España.", sv: "Du kommer att vilja åka tillbaka till Spanien.", en: "You will want to go back to Spain." } },
    },
  },
  {
    infinitive: "saber", sv: "veta/kunna", en: "to know", level: "B1",
    tenses: {
      presente: { yo: "sé", tú: "sabes", él: "sabe", nosotros: "sabemos", vosotros: "sabéis", ellos: "saben", example: { es: "No sé la respuesta.", sv: "Jag vet inte svaret.", en: "I don't know the answer." } },
      preterito: { yo: "supe", tú: "supiste", él: "supo", nosotros: "supimos", vosotros: "supisteis", ellos: "supieron", example: { es: "Supe la verdad demasiado tarde.", sv: "Jag fick veta sanningen för sent.", en: "I found out the truth too late." } },
      futuro: { yo: "sabré", tú: "sabrás", él: "sabrá", nosotros: "sabremos", vosotros: "sabréis", ellos: "sabrán", example: { es: "Pronto sabremos los resultados.", sv: "Snart kommer vi att veta resultaten.", en: "Soon we will know the results." } },
    },
  },
];

export const nouns: NounData[] = [
  { spanish: "casa", sv: "hus", en: "house", gender: "la", plural: "casas", level: "A1", example: { es: "La casa es grande.", sv: "Huset är stort.", en: "The house is big." } },
  { spanish: "perro", sv: "hund", en: "dog", gender: "el", plural: "perros", level: "A1", example: { es: "El perro es amigable.", sv: "Hunden är vänlig.", en: "The dog is friendly." } },
  { spanish: "libro", sv: "bok", en: "book", gender: "el", plural: "libros", level: "A1", example: { es: "El libro es interesante.", sv: "Boken är intressant.", en: "The book is interesting." } },
  { spanish: "agua", sv: "vatten", en: "water", gender: "el", plural: "aguas", level: "A1", example: { es: "El agua está fría.", sv: "Vattnet är kallt.", en: "The water is cold." } },
  { spanish: "mesa", sv: "bord", en: "table", gender: "la", plural: "mesas", level: "A1", example: { es: "La mesa está limpia.", sv: "Bordet är rent.", en: "The table is clean." } },
  { spanish: "coche", sv: "bil", en: "car", gender: "el", plural: "coches", level: "A1", example: { es: "El coche es rojo.", sv: "Bilen är röd.", en: "The car is red." } },
  { spanish: "ciudad", sv: "stad", en: "city", gender: "la", plural: "ciudades", level: "A2", example: { es: "La ciudad es bonita.", sv: "Staden är vacker.", en: "The city is beautiful." } },
  { spanish: "trabajo", sv: "arbete/jobb", en: "work/job", gender: "el", plural: "trabajos", level: "A2", example: { es: "El trabajo es difícil.", sv: "Jobbet är svårt.", en: "The job is difficult." } },
  { spanish: "problema", sv: "problem", en: "problem", gender: "el", plural: "problemas", level: "B1", example: { es: "El problema es complicado.", sv: "Problemet är komplicerat.", en: "The problem is complicated." } },
];

export const adjectives: AdjectiveData[] = [
  { masculine: "grande", feminine: "grande", sv: "stor", en: "big", level: "A1", example: { es: "La casa es grande.", sv: "Huset är stort.", en: "The house is big." } },
  { masculine: "pequeño", feminine: "pequeña", sv: "liten", en: "small", level: "A1", example: { es: "El gato es pequeño.", sv: "Katten är liten.", en: "The cat is small." } },
  { masculine: "bueno", feminine: "buena", sv: "bra", en: "good", level: "A1", example: { es: "La comida es buena.", sv: "Maten är bra.", en: "The food is good." } },
  { masculine: "malo", feminine: "mala", sv: "dålig", en: "bad", level: "A1", example: { es: "El tiempo es malo.", sv: "Vädret är dåligt.", en: "The weather is bad." } },
  { masculine: "bonito", feminine: "bonita", sv: "vacker", en: "pretty", level: "A1", example: { es: "La flor es bonita.", sv: "Blomman är vacker.", en: "The flower is pretty." } },
  { masculine: "rápido", feminine: "rápida", sv: "snabb", en: "fast", level: "A2", example: { es: "El tren es rápido.", sv: "Tåget är snabbt.", en: "The train is fast." } },
  { masculine: "difícil", feminine: "difícil", sv: "svår", en: "difficult", level: "A2", example: { es: "El examen es difícil.", sv: "Provet är svårt.", en: "The exam is difficult." } },
  { masculine: "interesante", feminine: "interesante", sv: "intressant", en: "interesting", level: "B1", example: { es: "El libro es interesante.", sv: "Boken är intressant.", en: "The book is interesting." } },
];

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
