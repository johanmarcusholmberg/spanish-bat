import type { GrammarLesson } from "./index";

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  // ─────────────────────────────────────── A1 ───────────────────────────────────────
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
    id: "a1-ser-estar",
    level: "A1",
    title: { en: "Ser vs Estar", sv: "Ser och estar" },
    summary: {
      en: "Two verbs for 'to be' — permanent traits vs. temporary states.",
      sv: "Två verb för 'att vara' — varaktiga egenskaper kontra tillfälliga tillstånd.",
    },
    explanation: {
      en: "Use ser for identity, profession, nationality, and lasting traits (Soy alta = I'm tall). Use estar for location, mood, and temporary conditions (Estoy cansado = I'm tired).",
      sv: "Använd ser för identitet, yrke, nationalitet och varaktiga drag (Soy alta = Jag är lång). Använd estar för plats, humör och tillfälliga tillstånd (Estoy cansado = Jag är trött).",
    },
    examples: [
      { es: "Soy profesor.", en: "I am a teacher.", sv: "Jag är lärare." },
      { es: "Estoy en casa.", en: "I am at home.", sv: "Jag är hemma." },
      { es: "Ella está triste hoy.", en: "She is sad today.", sv: "Hon är ledsen idag." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Yo ___ de Suecia.'",
          en: "Choose the correct verb: 'Yo ___ de Suecia.' (I'm from Sweden.)",
          sv: "Välj rätt verb: 'Yo ___ de Suecia.' (Jag är från Sverige.)",
        },
        options: ["soy", "estoy", "es", "está"],
        answer: "soy",
      },
      {
        id: "q2",
        prompt: {
          es: "'El café ___ caliente.'",
          en: "Choose the correct verb: 'El café ___ caliente.' (The coffee is hot.)",
          sv: "Välj rätt verb: 'El café ___ caliente.' (Kaffet är varmt.)",
        },
        options: ["es", "está", "son", "estoy"],
        answer: "está",
      },
    ],
  },

  // ─────────────────────────────────────── A2 ───────────────────────────────────────
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
    id: "a2-stem-changing",
    level: "A2",
    title: { en: "Stem-Changing Verbs", sv: "Vokalväxlande verb" },
    summary: {
      en: "Verbs whose stem vowel changes in the present tense.",
      sv: "Verb vars stamvokal ändras i presens.",
    },
    explanation: {
      en: "Some verbs change their stem vowel in all forms except nosotros/vosotros. Common patterns: e→ie (querer → quiero), o→ue (poder → puedo), e→i (pedir → pido).",
      sv: "Vissa verb ändrar stamvokalen i alla former utom nosotros/vosotros. Vanliga mönster: e→ie (querer → quiero), o→ue (poder → puedo), e→i (pedir → pido).",
    },
    examples: [
      { es: "Quiero un café.", en: "I want a coffee.", sv: "Jag vill ha en kaffe." },
      { es: "¿Puedes ayudarme?", en: "Can you help me?", sv: "Kan du hjälpa mig?" },
      { es: "Pedimos la cuenta.", en: "We're asking for the bill.", sv: "Vi ber om notan." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Yo ___ (poder) ir mañana.'",
          en: "Conjugate: 'Yo ___ (poder) ir mañana.'",
          sv: "Böj: 'Yo ___ (poder) ir mañana.'",
        },
        options: ["podo", "puedo", "puedes", "puede"],
        answer: "puedo",
      },
      {
        id: "q2",
        prompt: {
          es: "'Ella ___ (querer) un té.'",
          en: "Conjugate: 'Ella ___ (querer) un té.'",
          sv: "Böj: 'Ella ___ (querer) un té.'",
        },
        options: ["quere", "quiere", "quieres", "queremos"],
        answer: "quiere",
      },
    ],
  },
  {
    id: "a2-gustar",
    level: "A2",
    title: { en: "Gustar — 'to like'", sv: "Gustar — 'att tycka om'" },
    summary: {
      en: "Express likes and dislikes with the unusual gustar construction.",
      sv: "Uttryck vad du gillar med den ovanliga gustar-konstruktionen.",
    },
    explanation: {
      en: "Gustar literally means 'to be pleasing'. The thing you like is the subject: Me gusta el café = 'Coffee is pleasing to me'. Use gusta with singular nouns and gustan with plural ones. Indirect-object pronouns: me, te, le, nos, os, les.",
      sv: "Gustar betyder bokstavligen 'att behaga'. Det du gillar är subjektet: Me gusta el café = 'Kaffe behagar mig'. Använd gusta med singular substantiv och gustan med plural. Indirekta objektspronomen: me, te, le, nos, os, les.",
    },
    examples: [
      { es: "Me gusta la música.", en: "I like music.", sv: "Jag tycker om musik." },
      { es: "Nos gustan los perros.", en: "We like dogs.", sv: "Vi tycker om hundar." },
      { es: "¿Te gusta bailar?", en: "Do you like dancing?", sv: "Tycker du om att dansa?" },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'A mí me ___ los libros.'",
          en: "Choose the correct form: 'A mí me ___ los libros.'",
          sv: "Välj rätt form: 'A mí me ___ los libros.'",
        },
        options: ["gusta", "gustan", "gusto", "gustamos"],
        answer: "gustan",
      },
      {
        id: "q2",
        prompt: {
          es: "'A ella le gusta ___.'",
          en: "Which one fits: 'A ella le gusta ___.'",
          sv: "Vilket passar: 'A ella le gusta ___.'",
        },
        options: ["los gatos", "el chocolate", "las flores", "viajan"],
        answer: "el chocolate",
      },
    ],
  },

  // ─────────────────────────────────────── B1 ───────────────────────────────────────
  {
    id: "b1-preterite",
    level: "B1",
    title: { en: "Preterite Tense", sv: "Preteritum" },
    summary: {
      en: "Talk about completed actions in the past.",
      sv: "Prata om avslutade handlingar i förfluten tid.",
    },
    explanation: {
      en: "Use the preterite for actions that have a clear beginning and end. Regular -ar endings: -é, -aste, -ó, -amos, -asteis, -aron. -er/-ir share a set: -í, -iste, -ió, -imos, -isteis, -ieron.",
      sv: "Använd preteritum för handlingar med tydlig början och slut. Regelbundna -ar-ändelser: -é, -aste, -ó, -amos, -asteis, -aron. -er/-ir delar en uppsättning: -í, -iste, -ió, -imos, -isteis, -ieron.",
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
      {
        id: "q2",
        prompt: {
          es: "'Ellos ___ (viajar) a México el año pasado.'",
          en: "Conjugate: 'Ellos ___ (viajar) a México el año pasado.'",
          sv: "Böj: 'Ellos ___ (viajar) a México el año pasado.'",
        },
        options: ["viajan", "viajaron", "viajaban", "viajarán"],
        answer: "viajaron",
      },
    ],
  },
  {
    id: "b1-imperfect",
    level: "B1",
    title: { en: "Imperfect Tense", sv: "Imperfekt" },
    summary: {
      en: "Describe ongoing or habitual past actions and background.",
      sv: "Beskriv pågående eller vanemässiga händelser i dåtid och bakgrund.",
    },
    explanation: {
      en: "Use the imperfect for repeated past actions, descriptions, age, and time. -ar endings: -aba, -abas, -aba, -ábamos, -abais, -aban. -er/-ir endings: -ía, -ías, -ía, -íamos, -íais, -ían. Only ser, ir, and ver are irregular.",
      sv: "Använd imperfekt för upprepade dåtidshändelser, beskrivningar, ålder och klockslag. -ar-ändelser: -aba, -abas, -aba, -ábamos, -abais, -aban. -er/-ir: -ía, -ías, -ía, -íamos, -íais, -ían. Endast ser, ir och ver är oregelbundna.",
    },
    examples: [
      { es: "Cuando era niño, jugaba al fútbol.", en: "When I was a kid, I used to play football.", sv: "När jag var liten brukade jag spela fotboll." },
      { es: "Eran las tres de la tarde.", en: "It was three in the afternoon.", sv: "Klockan var tre på eftermiddagen." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'De pequeño yo ___ (vivir) en Madrid.'",
          en: "Conjugate: 'De pequeño yo ___ (vivir) en Madrid.'",
          sv: "Böj: 'De pequeño yo ___ (vivir) en Madrid.'",
        },
        options: ["viví", "vivo", "vivía", "viviría"],
        answer: "vivía",
      },
      {
        id: "q2",
        prompt: {
          es: "'Nosotros ___ (ser) muy amigos.'",
          en: "Conjugate (imperfect): 'Nosotros ___ (ser) muy amigos.'",
          sv: "Böj (imperfekt): 'Nosotros ___ (ser) muy amigos.'",
        },
        options: ["fuimos", "somos", "éramos", "seríamos"],
        answer: "éramos",
      },
    ],
  },
  {
    id: "b1-direct-object-pronouns",
    level: "B1",
    title: { en: "Direct Object Pronouns", sv: "Direkta objektspronomen" },
    summary: {
      en: "Replace nouns with me, te, lo, la, nos, os, los, las.",
      sv: "Ersätt substantiv med me, te, lo, la, nos, os, los, las.",
    },
    explanation: {
      en: "Direct object pronouns replace the noun receiving the action. Lo/los for masculine, la/las for feminine. They go before the conjugated verb (Lo veo) or attached to an infinitive/gerund (Quiero verlo).",
      sv: "Direkta objektspronomen ersätter substantivet som tar emot handlingen. Lo/los för maskulinum, la/las för femininum. De står före det böjda verbet (Lo veo) eller fästs vid infinitiv/gerundium (Quiero verlo).",
    },
    examples: [
      { es: "¿El libro? Lo leo.", en: "The book? I'm reading it.", sv: "Boken? Jag läser den." },
      { es: "Las llaves, no las encuentro.", en: "The keys, I can't find them.", sv: "Nycklarna, jag hittar dem inte." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'¿Ves la película?' — 'Sí, ___ veo.'",
          en: "Replace correctly: '¿Ves la película?' — 'Sí, ___ veo.'",
          sv: "Ersätt rätt: '¿Ves la película?' — 'Sí, ___ veo.'",
        },
        options: ["lo", "la", "le", "las"],
        answer: "la",
      },
      {
        id: "q2",
        prompt: {
          es: "'Compro los zapatos.' → 'Yo ___ compro.'",
          en: "Replace correctly: 'Compro los zapatos.' → 'Yo ___ compro.'",
          sv: "Ersätt rätt: 'Compro los zapatos.' → 'Yo ___ compro.'",
        },
        options: ["la", "lo", "los", "las"],
        answer: "los",
      },
    ],
  },

  // ─────────────────────────────────────── B2 ───────────────────────────────────────
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
      {
        id: "q2",
        prompt: {
          es: "'Dudo que ellos ___ (saber) la respuesta.'",
          en: "Conjugate (subjunctive): 'Dudo que ellos ___ (saber) la respuesta.'",
          sv: "Böj (konjunktiv): 'Dudo que ellos ___ (saber) la respuesta.'",
        },
        options: ["saben", "sepan", "sabrán", "supieran"],
        answer: "sepan",
      },
    ],
  },
  {
    id: "b2-por-para",
    level: "B2",
    title: { en: "Por vs Para", sv: "Por och para" },
    summary: {
      en: "Two prepositions usually translated as 'for' — but very different.",
      sv: "Två prepositioner som båda ofta översätts till 'för' — men med olika betydelse.",
    },
    explanation: {
      en: "Use por for cause, duration, exchange, and means (gracias por, por la mañana, dos por uno). Use para for purpose, destination, deadlines, and recipients (para ti, para el lunes, para aprender).",
      sv: "Använd por för orsak, tidslängd, utbyte och medel (gracias por, por la mañana, dos por uno). Använd para för syfte, mål, deadline och mottagare (para ti, para el lunes, para aprender).",
    },
    examples: [
      { es: "Gracias por tu ayuda.", en: "Thanks for your help.", sv: "Tack för din hjälp." },
      { es: "Este regalo es para ti.", en: "This gift is for you.", sv: "Den här presenten är till dig." },
      { es: "Estudio para aprender.", en: "I study in order to learn.", sv: "Jag pluggar för att lära mig." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Salgo ___ Madrid mañana.'",
          en: "Choose por or para: 'Salgo ___ Madrid mañana.' (I'm leaving for Madrid tomorrow.)",
          sv: "Välj por eller para: 'Salgo ___ Madrid mañana.' (Jag åker till Madrid imorgon.)",
        },
        options: ["por", "para", "de", "en"],
        answer: "para",
      },
      {
        id: "q2",
        prompt: {
          es: "'Caminamos ___ el parque.'",
          en: "Choose por or para: 'Caminamos ___ el parque.' (We walk through the park.)",
          sv: "Välj por eller para: 'Caminamos ___ el parque.' (Vi går genom parken.)",
        },
        options: ["para", "por", "a", "con"],
        answer: "por",
      },
    ],
  },
  {
    id: "b2-future",
    level: "B2",
    title: { en: "Future Tense", sv: "Futurum" },
    summary: {
      en: "Talk about what will happen.",
      sv: "Prata om vad som kommer att hända.",
    },
    explanation: {
      en: "Add the endings -é, -ás, -á, -emos, -éis, -án to the full infinitive (hablar → hablaré). Common irregular stems: tener → tendr-, hacer → har-, decir → dir-, salir → saldr-, poder → podr-.",
      sv: "Lägg ändelserna -é, -ás, -á, -emos, -éis, -án till hela infinitiven (hablar → hablaré). Vanliga oregelbundna stammar: tener → tendr-, hacer → har-, decir → dir-, salir → saldr-, poder → podr-.",
    },
    examples: [
      { es: "Mañana viajaré a Sevilla.", en: "Tomorrow I'll travel to Sevilla.", sv: "Imorgon reser jag till Sevilla." },
      { es: "Ellos tendrán éxito.", en: "They will succeed.", sv: "De kommer att lyckas." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Yo ___ (hacer) la cena.'",
          en: "Conjugate (future): 'Yo ___ (hacer) la cena.'",
          sv: "Böj (futurum): 'Yo ___ (hacer) la cena.'",
        },
        options: ["hago", "haré", "hacía", "hiciera"],
        answer: "haré",
      },
      {
        id: "q2",
        prompt: {
          es: "'Nosotros ___ (salir) temprano.'",
          en: "Conjugate (future): 'Nosotros ___ (salir) temprano.'",
          sv: "Böj (futurum): 'Nosotros ___ (salir) temprano.'",
        },
        options: ["salimos", "saldremos", "saldríamos", "salíamos"],
        answer: "saldremos",
      },
    ],
  },

  // ─────────────────────────────────────── C1 ───────────────────────────────────────
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
      {
        id: "q2",
        prompt: {
          es: "'Si ___ (estudiar) más, aprobarías el examen.'",
          en: "Choose the imperfect-subjunctive form.",
          sv: "Välj imperfekt konjunktivformen.",
        },
        options: ["estudias", "estudiaras", "estudiarías", "estudiaste"],
        answer: "estudiaras",
      },
    ],
  },
  {
    id: "c1-perfect-subjunctive",
    level: "C1",
    title: { en: "Perfect Subjunctive", sv: "Perfekt konjunktiv" },
    summary: {
      en: "Express past actions in the subjunctive (haya + participle).",
      sv: "Uttryck dåtidshändelser i konjunktiv (haya + particip).",
    },
    explanation: {
      en: "Form: present subjunctive of haber (haya, hayas, haya, hayamos, hayáis, hayan) + past participle. Use after subjunctive triggers when the action happened before now: 'Me alegro de que hayas venido.'",
      sv: "Form: presens konjunktiv av haber (haya, hayas, haya, hayamos, hayáis, hayan) + perfekt particip. Används efter konjunktivutlösare när handlingen hände före nu: 'Me alegro de que hayas venido.'",
    },
    examples: [
      { es: "Espero que hayan llegado bien.", en: "I hope they have arrived safely.", sv: "Jag hoppas att de har kommit fram säkert." },
      { es: "Es posible que haya olvidado.", en: "It's possible that he has forgotten.", sv: "Det är möjligt att han har glömt." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Dudo que tú ___ (terminar) la tarea.'",
          en: "Choose the perfect subjunctive: 'Dudo que tú ___ (terminar) la tarea.'",
          sv: "Välj perfekt konjunktiv: 'Dudo que tú ___ (terminar) la tarea.'",
        },
        options: ["terminaste", "hayas terminado", "habías terminado", "termines"],
        answer: "hayas terminado",
      },
      {
        id: "q2",
        prompt: {
          es: "'Me alegra que ellos ___ (venir).'",
          en: "Choose the perfect subjunctive: 'Me alegra que ellos ___ (venir).'",
          sv: "Välj perfekt konjunktiv: 'Me alegra que ellos ___ (venir).'",
        },
        options: ["vinieron", "vienen", "hayan venido", "vendrían"],
        answer: "hayan venido",
      },
    ],
  },
  {
    id: "c1-passive-se",
    level: "C1",
    title: { en: "Passive 'se'", sv: "Passivt se" },
    summary: {
      en: "An impersonal way to talk about actions without naming who does them.",
      sv: "Ett opersonligt sätt att prata om handlingar utan att nämna vem som gör dem.",
    },
    explanation: {
      en: "Use 'se' + third-person verb (singular if subject is singular, plural if plural) for passive/impersonal sentences: 'Se vende pan' (Bread is sold), 'Se hablan muchos idiomas' (Many languages are spoken).",
      sv: "Använd 'se' + verb i tredje person (singular om subjektet är singular, plural om plural) för passiva/opersonliga meningar: 'Se vende pan' (Bröd säljs), 'Se hablan muchos idiomas' (Många språk talas).",
    },
    examples: [
      { es: "Se necesita un médico.", en: "A doctor is needed.", sv: "En läkare behövs." },
      { es: "Aquí se hablan tres idiomas.", en: "Three languages are spoken here.", sv: "Här talas tre språk." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'En esta tienda ___ (vender) ropa.'",
          en: "Choose the correct form: 'En esta tienda ___ ropa.'",
          sv: "Välj rätt form: 'En esta tienda ___ ropa.'",
        },
        options: ["se venden", "se vende", "vende", "venden"],
        answer: "se vende",
      },
      {
        id: "q2",
        prompt: {
          es: "'___ casas nuevas en este barrio.'",
          en: "Choose the correct form: '___ casas nuevas en este barrio.'",
          sv: "Välj rätt form: '___ casas nuevas en este barrio.'",
        },
        options: ["Se construye", "Se construyen", "Construye", "Construyen"],
        answer: "Se construyen",
      },
    ],
  },

  // ─────────────────────────────────────── C2 ───────────────────────────────────────
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
      {
        id: "q2",
        prompt: {
          es: "'Estar en las nubes' significa…",
          en: "'Estar en las nubes' means…",
          sv: "'Estar en las nubes' betyder…",
        },
        options: ["to be daydreaming", "to be confident", "to be late", "to be flying"],
        answer: "to be daydreaming",
      },
    ],
  },
  {
    id: "c2-discourse-connectors",
    level: "C2",
    title: { en: "Discourse Connectors", sv: "Diskursmarkörer" },
    summary: {
      en: "Link complex ideas with sin embargo, no obstante, por consiguiente…",
      sv: "Knyt ihop komplexa idéer med sin embargo, no obstante, por consiguiente…",
    },
    explanation: {
      en: "Advanced writing relies on precise connectors: 'sin embargo' / 'no obstante' (however), 'por consiguiente' / 'por lo tanto' (therefore), 'en cambio' (on the other hand), 'asimismo' (likewise), 'a pesar de que' (despite the fact that). Picking the right one tightens your argument.",
      sv: "Avancerat skrivande bygger på precisa konnektorer: 'sin embargo' / 'no obstante' (dock/emellertid), 'por consiguiente' / 'por lo tanto' (därför), 'en cambio' (å andra sidan), 'asimismo' (likaså), 'a pesar de que' (trots att). Att välja rätt skärper argumentet.",
    },
    examples: [
      { es: "Estaba cansado; sin embargo, terminó el trabajo.", en: "He was tired; however, he finished the job.", sv: "Han var trött; ändå slutförde han arbetet." },
      { es: "Llovió mucho; por consiguiente, cancelaron el evento.", en: "It rained a lot; therefore, they canceled the event.", sv: "Det regnade mycket; därför ställde de in evenemanget." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "'Estudió poco; ___, aprobó el examen.'",
          en: "Choose the connector: 'Estudió poco; ___, aprobó el examen.' (He hardly studied; however, he passed.)",
          sv: "Välj konnektor: 'Estudió poco; ___, aprobó el examen.' (Han pluggade lite; ändå klarade han provet.)",
        },
        options: ["además", "por consiguiente", "sin embargo", "asimismo"],
        answer: "sin embargo",
      },
      {
        id: "q2",
        prompt: {
          es: "'Trabaja mucho; ___, gana bien.'",
          en: "Choose the connector: 'Trabaja mucho; ___, gana bien.' (He works a lot; therefore, he earns well.)",
          sv: "Välj konnektor: 'Trabaja mucho; ___, gana bien.' (Han jobbar mycket; därför tjänar han bra.)",
        },
        options: ["en cambio", "por lo tanto", "no obstante", "a pesar de que"],
        answer: "por lo tanto",
      },
    ],
  },
  {
    id: "c2-reported-speech",
    level: "C2",
    title: { en: "Reported Speech", sv: "Indirekt anföring" },
    summary: {
      en: "Shift tenses, pronouns, and time markers when reporting what someone said.",
      sv: "Byt tempus, pronomen och tidsmarkörer när du återger vad någon sagt.",
    },
    explanation: {
      en: "When the introducing verb is in the past (dijo, comentó), backshift tenses: present → imperfect, preterite → pluperfect, future → conditional. Time/place markers also shift (hoy → aquel día, mañana → al día siguiente, aquí → allí).",
      sv: "När det inledande verbet står i dåtid (dijo, comentó) skiftas tempus: presens → imperfekt, preteritum → pluskvamperfekt, futurum → konditionalis. Tids-/platsmarkörer skiftas också (hoy → aquel día, mañana → al día siguiente, aquí → allí).",
    },
    examples: [
      { es: "Dijo: 'Estoy cansado'. → Dijo que estaba cansado.", en: "He said: 'I'm tired.' → He said he was tired.", sv: "Han sa: 'Jag är trött.' → Han sa att han var trött." },
      { es: "'Vendré mañana.' → Dijo que vendría al día siguiente.", en: "'I'll come tomorrow.' → He said he would come the next day.", sv: "'Jag kommer imorgon.' → Han sa att han skulle komma dagen efter." },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          es: "Direct: 'Estoy enferma.' → Reported: 'Dijo que ___ enferma.'",
          en: "Convert to reported speech: 'Estoy enferma' → 'Dijo que ___ enferma.'",
          sv: "Omvandla till indirekt tal: 'Estoy enferma' → 'Dijo que ___ enferma.'",
        },
        options: ["está", "estaba", "esté", "estuvo"],
        answer: "estaba",
      },
      {
        id: "q2",
        prompt: {
          es: "Direct: 'Iré mañana.' → Reported: 'Comentó que ___ al día siguiente.'",
          en: "Convert to reported speech: 'Iré mañana.' → 'Comentó que ___ al día siguiente.'",
          sv: "Omvandla till indirekt tal: 'Iré mañana.' → 'Comentó que ___ al día siguiente.'",
        },
        options: ["irá", "iba", "iría", "fuera"],
        answer: "iría",
      },
    ],
  },
];
