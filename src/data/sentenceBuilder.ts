import { Level } from "@/contexts/AuthContext";

export interface SentenceExercise {
  id: string;
  correctOrder: string[];
  alternateOrders?: string[][];
  translation: { sv: string; en: string };
  level: Level;
  category: string;
  grammarFocus?: string;
  difficulty?: 1 | 2 | 3;
}

export const sentenceExercises: SentenceExercise[] = [
  // ═══════════════════════════════════════════════════
  // A1 — Basic sentences (20 exercises)
  // ═══════════════════════════════════════════════════
  { id: "sb-a1-1", correctOrder: ["Yo", "me", "llamo", "María"], translation: { sv: "Jag heter María", en: "My name is María" }, level: "A1", category: "greetings", grammarFocus: "reflexive", difficulty: 1 },
  { id: "sb-a1-2", correctOrder: ["Ella", "tiene", "un", "gato"], translation: { sv: "Hon har en katt", en: "She has a cat" }, level: "A1", category: "basics", grammarFocus: "tener", difficulty: 1 },
  { id: "sb-a1-3", correctOrder: ["Nosotros", "vivimos", "en", "Madrid"], translation: { sv: "Vi bor i Madrid", en: "We live in Madrid" }, level: "A1", category: "basics", grammarFocus: "vivir", difficulty: 1 },
  { id: "sb-a1-4", correctOrder: ["El", "libro", "es", "interesante"], translation: { sv: "Boken är intressant", en: "The book is interesting" }, level: "A1", category: "basics", grammarFocus: "ser+adj", difficulty: 1 },
  { id: "sb-a1-5", correctOrder: ["Tú", "hablas", "español", "bien"], alternateOrders: [["Tú", "hablas", "bien", "español"]], translation: { sv: "Du talar spanska bra", en: "You speak Spanish well" }, level: "A1", category: "basics", grammarFocus: "hablar", difficulty: 1 },
  { id: "sb-a1-6", correctOrder: ["La", "casa", "es", "grande"], translation: { sv: "Huset är stort", en: "The house is big" }, level: "A1", category: "basics", grammarFocus: "ser+adj", difficulty: 1 },
  { id: "sb-a1-7", correctOrder: ["Yo", "como", "una", "manzana"], translation: { sv: "Jag äter ett äpple", en: "I eat an apple" }, level: "A1", category: "food", grammarFocus: "comer", difficulty: 1 },
  { id: "sb-a1-8", correctOrder: ["Ellos", "son", "mis", "amigos"], translation: { sv: "De är mina vänner", en: "They are my friends" }, level: "A1", category: "basics", grammarFocus: "ser", difficulty: 1 },
  { id: "sb-a1-9", correctOrder: ["El", "perro", "está", "aquí"], translation: { sv: "Hunden är här", en: "The dog is here" }, level: "A1", category: "basics", grammarFocus: "estar", difficulty: 1 },
  { id: "sb-a1-10", correctOrder: ["Yo", "quiero", "agua", "fría"], translation: { sv: "Jag vill ha kallt vatten", en: "I want cold water" }, level: "A1", category: "food", grammarFocus: "querer", difficulty: 1 },
  // A1 — difficulty 2
  { id: "sb-a1-11", correctOrder: ["Mi", "madre", "cocina", "muy", "bien"], translation: { sv: "Min mamma lagar mat mycket bra", en: "My mother cooks very well" }, level: "A1", category: "family", grammarFocus: "cocinar", difficulty: 2 },
  { id: "sb-a1-12", correctOrder: ["Él", "trabaja", "en", "un", "hospital"], translation: { sv: "Han arbetar på ett sjukhus", en: "He works in a hospital" }, level: "A1", category: "work", grammarFocus: "trabajar", difficulty: 2 },
  { id: "sb-a1-13", correctOrder: ["Yo", "estudio", "español", "todos", "los", "días"], translation: { sv: "Jag studerar spanska varje dag", en: "I study Spanish every day" }, level: "A1", category: "studies", grammarFocus: "estudiar", difficulty: 2 },
  { id: "sb-a1-14", correctOrder: ["La", "comida", "está", "muy", "rica"], translation: { sv: "Maten är jättegod", en: "The food is very tasty" }, level: "A1", category: "food", grammarFocus: "estar+adj", difficulty: 2 },
  { id: "sb-a1-15", correctOrder: ["Nosotros", "tenemos", "dos", "hijos"], translation: { sv: "Vi har två barn", en: "We have two children" }, level: "A1", category: "family", grammarFocus: "tener", difficulty: 2 },
  { id: "sb-a1-16", correctOrder: ["¿Dónde", "está", "el", "baño?"], translation: { sv: "Var är toaletten?", en: "Where is the bathroom?" }, level: "A1", category: "basics", grammarFocus: "questions", difficulty: 2 },
  { id: "sb-a1-17", correctOrder: ["Me", "gusta", "el", "chocolate"], translation: { sv: "Jag gillar choklad", en: "I like chocolate" }, level: "A1", category: "food", grammarFocus: "gustar", difficulty: 2 },
  { id: "sb-a1-18", correctOrder: ["Ella", "es", "mi", "hermana", "mayor"], translation: { sv: "Hon är min storasyster", en: "She is my older sister" }, level: "A1", category: "family", grammarFocus: "ser", difficulty: 2 },
  { id: "sb-a1-19", correctOrder: ["Hoy", "hace", "mucho", "calor"], translation: { sv: "Det är väldigt varmt idag", en: "It is very hot today" }, level: "A1", category: "weather", grammarFocus: "hacer+weather", difficulty: 3 },
  { id: "sb-a1-20", correctOrder: ["Yo", "vivo", "con", "mi", "familia"], translation: { sv: "Jag bor med min familj", en: "I live with my family" }, level: "A1", category: "family", grammarFocus: "vivir", difficulty: 3 },

  // ═══════════════════════════════════════════════════
  // A2 (20 exercises)
  // ═══════════════════════════════════════════════════
  { id: "sb-a2-1", correctOrder: ["Me", "levanto", "a", "las", "siete"], translation: { sv: "Jag går upp klockan sju", en: "I get up at seven" }, level: "A2", category: "daily", grammarFocus: "reflexive", difficulty: 1 },
  { id: "sb-a2-2", correctOrder: ["Ayer", "fui", "al", "cine", "con", "mis", "amigos"], translation: { sv: "Igår gick jag på bio med mina vänner", en: "Yesterday I went to the cinema with my friends" }, level: "A2", category: "past", grammarFocus: "pretérito", difficulty: 1 },
  { id: "sb-a2-3", correctOrder: ["El", "restaurante", "está", "cerca", "del", "hotel"], translation: { sv: "Restaurangen är nära hotellet", en: "The restaurant is near the hotel" }, level: "A2", category: "directions", grammarFocus: "estar+location", difficulty: 1 },
  { id: "sb-a2-4", correctOrder: ["Me", "gusta", "mucho", "la", "música", "española"], translation: { sv: "Jag gillar spansk musik mycket", en: "I really like Spanish music" }, level: "A2", category: "likes", grammarFocus: "gustar", difficulty: 1 },
  { id: "sb-a2-5", correctOrder: ["Ella", "compró", "un", "vestido", "rojo", "ayer"], alternateOrders: [["Ayer", "ella", "compró", "un", "vestido", "rojo"]], translation: { sv: "Hon köpte en röd klänning igår", en: "She bought a red dress yesterday" }, level: "A2", category: "past", grammarFocus: "pretérito", difficulty: 1 },
  { id: "sb-a2-6", correctOrder: ["Necesito", "ir", "al", "supermercado", "esta", "tarde"], translation: { sv: "Jag behöver gå till snabbköpet i eftermiddag", en: "I need to go to the supermarket this afternoon" }, level: "A2", category: "daily", grammarFocus: "necesitar+inf", difficulty: 1 },
  { id: "sb-a2-7", correctOrder: ["El", "tren", "sale", "a", "las", "diez"], translation: { sv: "Tåget avgår klockan tio", en: "The train leaves at ten" }, level: "A2", category: "travel", grammarFocus: "salir", difficulty: 1 },
  { id: "sb-a2-8", correctOrder: ["Mi", "hermana", "estudia", "medicina", "en", "la", "universidad"], translation: { sv: "Min syster studerar medicin på universitetet", en: "My sister studies medicine at the university" }, level: "A2", category: "studies", grammarFocus: "estudiar", difficulty: 1 },
  // A2 — difficulty 2
  { id: "sb-a2-9", correctOrder: ["Siempre", "desayuno", "antes", "de", "ir", "a", "trabajar"], translation: { sv: "Jag äter alltid frukost innan jag går till jobbet", en: "I always have breakfast before going to work" }, level: "A2", category: "daily", grammarFocus: "antes de+inf", difficulty: 2 },
  { id: "sb-a2-10", correctOrder: ["El", "fin", "de", "semana", "pasado", "fuimos", "a", "la", "playa"], translation: { sv: "Förra helgen åkte vi till stranden", en: "Last weekend we went to the beach" }, level: "A2", category: "past", grammarFocus: "pretérito", difficulty: 2 },
  { id: "sb-a2-11", correctOrder: ["¿Puedes", "ayudarme", "con", "la", "tarea?"], translation: { sv: "Kan du hjälpa mig med läxan?", en: "Can you help me with the homework?" }, level: "A2", category: "requests", grammarFocus: "poder+inf", difficulty: 2 },
  { id: "sb-a2-12", correctOrder: ["Esta", "mañana", "me", "duché", "y", "me", "vestí"], translation: { sv: "I morse duschade jag och klädde mig", en: "This morning I showered and got dressed" }, level: "A2", category: "daily", grammarFocus: "reflexive+pretérito", difficulty: 2 },
  { id: "sb-a2-13", correctOrder: ["Voy", "a", "comprar", "un", "regalo", "para", "mi", "amiga"], translation: { sv: "Jag ska köpa en present till min kompis", en: "I'm going to buy a gift for my friend" }, level: "A2", category: "shopping", grammarFocus: "ir a+inf", difficulty: 2 },
  { id: "sb-a2-14", correctOrder: ["En", "verano", "hace", "mucho", "calor", "en", "España"], translation: { sv: "På sommaren är det väldigt varmt i Spanien", en: "In summer it's very hot in Spain" }, level: "A2", category: "weather", grammarFocus: "hacer+weather", difficulty: 2 },
  { id: "sb-a2-15", correctOrder: ["Mis", "padres", "llegaron", "ayer", "por", "la", "noche"], alternateOrders: [["Ayer", "por", "la", "noche", "llegaron", "mis", "padres"]], translation: { sv: "Mina föräldrar kom igår kväll", en: "My parents arrived last night" }, level: "A2", category: "past", grammarFocus: "pretérito", difficulty: 2 },
  // A2 — difficulty 3
  { id: "sb-a2-16", correctOrder: ["Cuando", "era", "pequeño", "vivía", "en", "un", "pueblo"], translation: { sv: "När jag var liten bodde jag i en by", en: "When I was little I lived in a village" }, level: "A2", category: "past", grammarFocus: "imperfecto", difficulty: 3 },
  { id: "sb-a2-17", correctOrder: ["Me", "gustaría", "reservar", "una", "mesa", "para", "dos"], translation: { sv: "Jag skulle vilja boka ett bord för två", en: "I'd like to reserve a table for two" }, level: "A2", category: "restaurant", grammarFocus: "condicional", difficulty: 3 },
  { id: "sb-a2-18", correctOrder: ["¿Cuánto", "cuesta", "este", "libro?"], translation: { sv: "Hur mycket kostar den här boken?", en: "How much does this book cost?" }, level: "A2", category: "shopping", grammarFocus: "questions", difficulty: 2 },
  { id: "sb-a2-19", correctOrder: ["Todavía", "no", "he", "terminado", "mis", "deberes"], translation: { sv: "Jag har fortfarande inte gjort klart mina läxor", en: "I still haven't finished my homework" }, level: "A2", category: "studies", grammarFocus: "pretérito perfecto", difficulty: 3 },
  { id: "sb-a2-20", correctOrder: ["A", "mi", "hermano", "le", "encanta", "jugar", "al", "fútbol"], translation: { sv: "Min bror älskar att spela fotboll", en: "My brother loves playing football" }, level: "A2", category: "hobbies", grammarFocus: "encantar+inf", difficulty: 3 },

  // ═══════════════════════════════════════════════════
  // B1 (16 exercises)
  // ═══════════════════════════════════════════════════
  { id: "sb-b1-1", correctOrder: ["Cuando", "era", "niño", "jugaba", "en", "el", "parque"], translation: { sv: "När jag var liten lekte jag i parken", en: "When I was a child, I played in the park" }, level: "B1", category: "past", grammarFocus: "imperfecto", difficulty: 1 },
  { id: "sb-b1-2", correctOrder: ["Espero", "que", "vengas", "a", "mi", "fiesta"], translation: { sv: "Jag hoppas att du kommer på min fest", en: "I hope you come to my party" }, level: "B1", category: "subjunctive", grammarFocus: "subjuntivo", difficulty: 1 },
  { id: "sb-b1-3", correctOrder: ["Si", "tengo", "tiempo", "iré", "al", "gimnasio"], alternateOrders: [["Iré", "al", "gimnasio", "si", "tengo", "tiempo"]], translation: { sv: "Om jag har tid, går jag till gymmet", en: "If I have time, I'll go to the gym" }, level: "B1", category: "conditional", grammarFocus: "si+presente+futuro", difficulty: 1 },
  { id: "sb-b1-4", correctOrder: ["Me", "encantaría", "viajar", "por", "toda", "América", "Latina"], translation: { sv: "Jag skulle älska att resa genom hela Latinamerika", en: "I'd love to travel through all of Latin America" }, level: "B1", category: "conditional", grammarFocus: "condicional", difficulty: 1 },
  { id: "sb-b1-5", correctOrder: ["Antes", "de", "que", "llueva", "debemos", "salir"], translation: { sv: "Innan det regnar bör vi gå", en: "Before it rains we should leave" }, level: "B1", category: "subjunctive", grammarFocus: "subjuntivo", difficulty: 2 },
  { id: "sb-b1-6", correctOrder: ["He", "estado", "aprendiendo", "español", "durante", "dos", "años"], translation: { sv: "Jag har lärt mig spanska i två år", en: "I have been learning Spanish for two years" }, level: "B1", category: "perfect", grammarFocus: "perfecto continuo", difficulty: 2 },
  { id: "sb-b1-7", correctOrder: ["Mientras", "yo", "cocinaba", "él", "limpiaba", "la", "casa"], translation: { sv: "Medan jag lagade mat städade han huset", en: "While I was cooking, he was cleaning the house" }, level: "B1", category: "past", grammarFocus: "imperfecto", difficulty: 2 },
  { id: "sb-b1-8", correctOrder: ["Es", "necesario", "que", "estudies", "más", "para", "el", "examen"], translation: { sv: "Det är nödvändigt att du pluggar mer inför provet", en: "It's necessary that you study more for the exam" }, level: "B1", category: "subjunctive", grammarFocus: "subjuntivo", difficulty: 2 },
  { id: "sb-b1-9", correctOrder: ["Cuando", "llegué", "a", "casa", "ya", "habían", "cenado"], translation: { sv: "När jag kom hem hade de redan ätit middag", en: "When I arrived home, they had already had dinner" }, level: "B1", category: "past", grammarFocus: "pluscuamperfecto", difficulty: 3 },
  { id: "sb-b1-10", correctOrder: ["Si", "pudiera", "elegiría", "vivir", "cerca", "del", "mar"], translation: { sv: "Om jag kunde skulle jag välja att bo nära havet", en: "If I could, I'd choose to live near the sea" }, level: "B1", category: "conditional", grammarFocus: "si+imperfecto subj+condicional", difficulty: 3 },
  { id: "sb-b1-11", correctOrder: ["Me", "alegra", "que", "hayas", "conseguido", "el", "trabajo"], translation: { sv: "Jag är glad att du har fått jobbet", en: "I'm glad you got the job" }, level: "B1", category: "subjunctive", grammarFocus: "subjuntivo perfecto", difficulty: 3 },
  { id: "sb-b1-12", correctOrder: ["Llevo", "tres", "meses", "buscando", "piso"], translation: { sv: "Jag har sökt lägenhet i tre månader", en: "I've been looking for an apartment for three months" }, level: "B1", category: "daily", grammarFocus: "llevar+gerundio", difficulty: 2 },
  { id: "sb-b1-13", correctOrder: ["Ojalá", "haga", "buen", "tiempo", "este", "fin", "de", "semana"], translation: { sv: "Förhoppningsvis blir det fint väder i helgen", en: "Hopefully the weather will be nice this weekend" }, level: "B1", category: "subjunctive", grammarFocus: "ojalá+subjuntivo", difficulty: 2 },
  { id: "sb-b1-14", correctOrder: ["No", "sabía", "que", "tú", "hablabas", "francés"], alternateOrders: [["No", "sabía", "que", "hablabas", "francés"]], translation: { sv: "Jag visste inte att du talade franska", en: "I didn't know you spoke French" }, level: "B1", category: "past", grammarFocus: "imperfecto", difficulty: 2 },
  { id: "sb-b1-15", correctOrder: ["Deberías", "ir", "al", "médico", "si", "te", "sientes", "mal"], translation: { sv: "Du borde gå till doktorn om du mår dåligt", en: "You should go to the doctor if you feel bad" }, level: "B1", category: "advice", grammarFocus: "condicional+si", difficulty: 2 },
  { id: "sb-b1-16", correctOrder: ["Hace", "mucho", "tiempo", "que", "no", "nos", "vemos"], translation: { sv: "Det är länge sedan vi sågs", en: "It's been a long time since we've seen each other" }, level: "B1", category: "social", grammarFocus: "hace+que", difficulty: 2 },

  // ═══════════════════════════════════════════════════
  // B2 (12 exercises)
  // ═══════════════════════════════════════════════════
  { id: "sb-b2-1", correctOrder: ["Si", "hubiera", "estudiado", "más", "habría", "aprobado", "el", "examen"], translation: { sv: "Om jag hade pluggat mer, hade jag klarat provet", en: "If I had studied more, I would have passed the exam" }, level: "B2", category: "conditional", grammarFocus: "si+pluscuamperfecto subj+condicional perfecto", difficulty: 1 },
  { id: "sb-b2-2", correctOrder: ["Aunque", "no", "me", "guste", "tengo", "que", "hacerlo"], translation: { sv: "Även om jag inte gillar det, måste jag göra det", en: "Even though I don't like it, I have to do it" }, level: "B2", category: "subjunctive", grammarFocus: "aunque+subjuntivo", difficulty: 1 },
  { id: "sb-b2-3", correctOrder: ["Es", "importante", "que", "todos", "cuidemos", "el", "medio", "ambiente"], translation: { sv: "Det är viktigt att vi alla tar hand om miljön", en: "It's important that we all take care of the environment" }, level: "B2", category: "subjunctive", grammarFocus: "subjuntivo", difficulty: 1 },
  { id: "sb-b2-4", correctOrder: ["No", "creo", "que", "sea", "posible", "terminar", "a", "tiempo"], translation: { sv: "Jag tror inte att det är möjligt att bli klar i tid", en: "I don't think it's possible to finish on time" }, level: "B2", category: "subjunctive", grammarFocus: "no creo que+subjuntivo", difficulty: 1 },
  { id: "sb-b2-5", correctOrder: ["En", "caso", "de", "que", "llueva", "llevaré", "un", "paraguas"], translation: { sv: "Ifall det regnar tar jag med ett paraply", en: "In case it rains, I'll bring an umbrella" }, level: "B2", category: "subjunctive", grammarFocus: "en caso de que+subjuntivo", difficulty: 2 },
  { id: "sb-b2-6", correctOrder: ["Se", "lo", "dije", "para", "que", "supiera", "la", "verdad"], translation: { sv: "Jag sa det till honom/henne för att de skulle veta sanningen", en: "I told them so they would know the truth" }, level: "B2", category: "subjunctive", grammarFocus: "para que+subjuntivo", difficulty: 2 },
  { id: "sb-b2-7", correctOrder: ["Habría", "ido", "contigo", "si", "me", "lo", "hubieras", "dicho"], translation: { sv: "Jag hade gått med dig om du hade sagt det till mig", en: "I would have gone with you if you had told me" }, level: "B2", category: "conditional", grammarFocus: "condicional perfecto", difficulty: 2 },
  { id: "sb-b2-8", correctOrder: ["A", "pesar", "de", "que", "estaba", "cansado", "siguió", "trabajando"], translation: { sv: "Trots att han var trött fortsatte han arbeta", en: "Despite being tired, he kept working" }, level: "B2", category: "concession", grammarFocus: "a pesar de que", difficulty: 2 },
  { id: "sb-b2-9", correctOrder: ["Le", "pedí", "que", "me", "enviara", "el", "documento"], translation: { sv: "Jag bad honom/henne skicka mig dokumentet", en: "I asked them to send me the document" }, level: "B2", category: "subjunctive", grammarFocus: "pedir que+subjuntivo", difficulty: 2 },
  { id: "sb-b2-10", correctOrder: ["Cuanto", "más", "practico", "mejor", "hablo", "español"], translation: { sv: "Ju mer jag övar, desto bättre talar jag spanska", en: "The more I practice, the better I speak Spanish" }, level: "B2", category: "comparisons", grammarFocus: "cuanto más...mejor", difficulty: 3 },
  { id: "sb-b2-11", correctOrder: ["No", "me", "habría", "enterado", "si", "no", "me", "lo", "hubieras", "contado"], translation: { sv: "Jag hade inte fått veta det om du inte hade berättat", en: "I wouldn't have found out if you hadn't told me" }, level: "B2", category: "conditional", grammarFocus: "condicional perfecto", difficulty: 3 },
  { id: "sb-b2-12", correctOrder: ["Ojalá", "hubiera", "empezado", "a", "estudiar", "antes"], translation: { sv: "Jag önskar att jag hade börjat studera tidigare", en: "I wish I had started studying earlier" }, level: "B2", category: "subjunctive", grammarFocus: "ojalá+pluscuamperfecto subj", difficulty: 3 },

  // ═══════════════════════════════════════════════════
  // C1 (8 exercises)
  // ═══════════════════════════════════════════════════
  { id: "sb-c1-1", correctOrder: ["De", "haber", "sabido", "la", "verdad", "habría", "actuado", "de", "otra", "manera"], translation: { sv: "Hade jag vetat sanningen, hade jag agerat annorlunda", en: "Had I known the truth, I would have acted differently" }, level: "C1", category: "conditional", grammarFocus: "de+infinitivo compuesto", difficulty: 1 },
  { id: "sb-c1-2", correctOrder: ["Por", "mucho", "que", "se", "esfuerce", "no", "conseguirá", "convencerme"], translation: { sv: "Hur mycket han än anstränger sig, kommer han inte lyckas övertyga mig", en: "No matter how hard he tries, he won't manage to convince me" }, level: "C1", category: "subjunctive", grammarFocus: "por mucho que+subjuntivo", difficulty: 1 },
  { id: "sb-c1-3", correctOrder: ["Siendo", "que", "nadie", "se", "opuso", "se", "aprobó", "la", "propuesta"], translation: { sv: "Eftersom ingen motsatte sig, godkändes förslaget", en: "Since nobody objected, the proposal was approved" }, level: "C1", category: "formal", grammarFocus: "siendo que", difficulty: 2 },
  { id: "sb-c1-4", correctOrder: ["Haga", "lo", "que", "haga", "siempre", "le", "critican"], translation: { sv: "Vad han än gör, kritiserar de honom alltid", en: "Whatever he does, they always criticize him" }, level: "C1", category: "subjunctive", grammarFocus: "haga lo que haga", difficulty: 2 },
  { id: "sb-c1-5", correctOrder: ["No", "bien", "llegó", "se", "puso", "a", "trabajar"], translation: { sv: "Så fort han kom började han arbeta", en: "As soon as he arrived, he started working" }, level: "C1", category: "formal", grammarFocus: "no bien", difficulty: 2 },
  { id: "sb-c1-6", correctOrder: ["Dicho", "esto", "procedamos", "a", "analizar", "los", "datos"], translation: { sv: "Med det sagt, låt oss gå vidare och analysera datan", en: "Having said this, let us proceed to analyze the data" }, level: "C1", category: "formal", grammarFocus: "participio absoluto", difficulty: 3 },
  { id: "sb-c1-7", correctOrder: ["A", "no", "ser", "que", "cambien", "las", "condiciones", "no", "firmaremos"], translation: { sv: "Om inte villkoren ändras, skriver vi inte under", en: "Unless the conditions change, we won't sign" }, level: "C1", category: "subjunctive", grammarFocus: "a no ser que+subjuntivo", difficulty: 2 },
  { id: "sb-c1-8", correctOrder: ["Cualesquiera", "que", "sean", "las", "razones", "no", "las", "acepto"], translation: { sv: "Vad än orsakerna är, accepterar jag dem inte", en: "Whatever the reasons may be, I don't accept them" }, level: "C1", category: "subjunctive", grammarFocus: "cualesquiera que+subjuntivo", difficulty: 3 },
];
