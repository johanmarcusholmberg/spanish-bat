import type { ReadingPassage } from "./index";

export const READING_PASSAGES: ReadingPassage[] = [
  // ─────────────────────────────────────── A1 ───────────────────────────────────────
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
    id: "a1-mi-familia",
    level: "A1",
    title: { en: "My family", sv: "Min familj" },
    text:
      "Me llamo Ana. Tengo veinticinco años y vivo en Madrid. Mi familia es grande. Tengo dos hermanos: Pedro y Luis. Mi madre se llama Carmen y mi padre se llama José. Ellos viven en Barcelona. Tengo un perro pequeño que se llama Max.",
    translation: {
      en: "My name is Ana. I'm twenty-five and I live in Madrid. My family is big. I have two brothers: Pedro and Luis. My mother is called Carmen and my father is called José. They live in Barcelona. I have a small dog called Max.",
      sv: "Jag heter Ana. Jag är tjugofem år och bor i Madrid. Min familj är stor. Jag har två bröder: Pedro och Luis. Min mamma heter Carmen och min pappa heter José. De bor i Barcelona. Jag har en liten hund som heter Max.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "Where does Ana live?", sv: "Var bor Ana?" },
        options: ["Barcelona", "Madrid", "Valencia", "Sevilla"],
        answer: "Madrid",
      },
      {
        id: "q2",
        prompt: { en: "How many brothers does Ana have?", sv: "Hur många bröder har Ana?" },
        options: ["One", "Two", "Three", "Four"],
        answer: "Two",
      },
      {
        id: "q3",
        prompt: { en: "What is the dog's name?", sv: "Vad heter hunden?" },
        options: ["Pedro", "Luis", "Max", "José"],
        answer: "Max",
      },
    ],
  },
  {
    id: "a1-mi-casa",
    level: "A1",
    title: { en: "My house", sv: "Mitt hus" },
    text:
      "Vivo en un apartamento pequeño en el centro de la ciudad. Tiene tres habitaciones: un dormitorio, un salón y una cocina. En el salón hay un sofá grande y una televisión. En la cocina hay una mesa con cuatro sillas. Mi dormitorio tiene una ventana grande. Me gusta mi apartamento porque es muy luminoso.",
    translation: {
      en: "I live in a small apartment in the city centre. It has three rooms: a bedroom, a living room, and a kitchen. In the living room there's a big sofa and a television. In the kitchen there's a table with four chairs. My bedroom has a big window. I like my apartment because it's very bright.",
      sv: "Jag bor i en liten lägenhet i centrum av staden. Den har tre rum: ett sovrum, ett vardagsrum och ett kök. I vardagsrummet finns en stor soffa och en tv. I köket finns ett bord med fyra stolar. Mitt sovrum har ett stort fönster. Jag tycker om min lägenhet för att den är väldigt ljus.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "Where is the apartment?", sv: "Var ligger lägenheten?" },
        options: ["In the suburbs", "In the city centre", "By the beach", "In the countryside"],
        answer: "In the city centre",
      },
      {
        id: "q2",
        prompt: { en: "How many chairs are in the kitchen?", sv: "Hur många stolar finns i köket?" },
        options: ["Two", "Three", "Four", "Five"],
        answer: "Four",
      },
      {
        id: "q3",
        prompt: { en: "Why does the narrator like the apartment?", sv: "Varför gillar berättaren lägenheten?" },
        options: ["It's big", "It's cheap", "It's bright", "It's new"],
        answer: "It's bright",
      },
    ],
  },

  // ─────────────────────────────────────── A2 ───────────────────────────────────────
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
    id: "a2-rutina",
    level: "A2",
    title: { en: "A normal day", sv: "En vanlig dag" },
    text:
      "Todos los días me levanto a las siete de la mañana. Primero, me ducho y me visto. Después, desayuno café con leche y tostadas. A las ocho y media voy al trabajo en autobús. A las dos como cerca de la oficina. Por la tarde voy al gimnasio. Por la noche ceno en casa y me acuesto a las once.",
    translation: {
      en: "Every day I get up at seven in the morning. First, I shower and get dressed. Then I have coffee with milk and toast for breakfast. At half past eight I take the bus to work. At two I have lunch near the office. In the afternoon I go to the gym. At night I have dinner at home and go to bed at eleven.",
      sv: "Varje dag stiger jag upp klockan sju på morgonen. Först duschar jag och klär på mig. Sedan äter jag frukost med kaffe med mjölk och rostat bröd. Halv nio åker jag buss till jobbet. Klockan två äter jag lunch nära kontoret. På eftermiddagen går jag till gymmet. På kvällen äter jag middag hemma och lägger mig vid elva.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "How does the person get to work?", sv: "Hur tar sig personen till jobbet?" },
        options: ["By car", "By bicycle", "By bus", "On foot"],
        answer: "By bus",
      },
      {
        id: "q2",
        prompt: { en: "What does the person do after work?", sv: "Vad gör personen efter jobbet?" },
        options: ["Studies", "Goes to the gym", "Goes to the cinema", "Cooks"],
        answer: "Goes to the gym",
      },
      {
        id: "q3",
        prompt: { en: "When does the person go to bed?", sv: "När lägger sig personen?" },
        options: ["At nine", "At ten", "At eleven", "At twelve"],
        answer: "At eleven",
      },
    ],
  },
  {
    id: "a2-mercado",
    level: "A2",
    title: { en: "At the market", sv: "På marknaden" },
    text:
      "Hoy es sábado y voy al mercado con mi madre. En el mercado hay muchas frutas y verduras. Compramos tomates, naranjas, plátanos y lechuga. Mi madre también compra pan y queso. Yo quiero comprar chocolate, pero mi madre dice que no. Todo es muy barato y hay mucha gente.",
    translation: {
      en: "Today is Saturday and I'm going to the market with my mum. At the market there are lots of fruits and vegetables. We buy tomatoes, oranges, bananas, and lettuce. My mum also buys bread and cheese. I want to buy chocolate, but my mum says no. Everything is very cheap and there are lots of people.",
      sv: "Idag är det lördag och jag går till marknaden med min mamma. På marknaden finns mycket frukt och grönsaker. Vi köper tomater, apelsiner, bananer och sallad. Min mamma köper också bröd och ost. Jag vill köpa choklad, men min mamma säger nej. Allt är väldigt billigt och det är mycket folk.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What day is it?", sv: "Vilken dag är det?" },
        options: ["Monday", "Friday", "Saturday", "Sunday"],
        answer: "Saturday",
      },
      {
        id: "q2",
        prompt: { en: "What does the narrator want to buy?", sv: "Vad vill berättaren köpa?" },
        options: ["Fish", "Chocolate", "Bread", "Fruit"],
        answer: "Chocolate",
      },
      {
        id: "q3",
        prompt: { en: "How are the prices?", sv: "Hur är priserna?" },
        options: ["Expensive", "Normal", "Cheap", "Free"],
        answer: "Cheap",
      },
    ],
  },

  // ─────────────────────────────────────── B1 ───────────────────────────────────────
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
    id: "b1-viaje",
    level: "B1",
    title: { en: "A trip to the south", sv: "En resa söderut" },
    text:
      "El verano pasado decidí hacer un viaje por el sur de España. Empecé en Granada, donde visité la Alhambra y me quedé impresionado por su belleza. Después fui a Sevilla, una ciudad llena de vida y de música flamenca. Por último, pasé tres días en Cádiz disfrutando de la playa. Volví a casa cansado pero muy feliz.",
    translation: {
      en: "Last summer I decided to take a trip around the south of Spain. I started in Granada, where I visited the Alhambra and was struck by its beauty. Then I went to Sevilla, a city full of life and flamenco music. Finally, I spent three days in Cádiz enjoying the beach. I came home tired but very happy.",
      sv: "Förra sommaren bestämde jag mig för att göra en resa runt södra Spanien. Jag började i Granada, där jag besökte Alhambra och blev imponerad av dess skönhet. Sedan åkte jag till Sevilla, en stad full av liv och flamencomusik. Slutligen tillbringade jag tre dagar i Cádiz och njöt av stranden. Jag kom hem trött men mycket glad.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "Where did the trip start?", sv: "Var började resan?" },
        options: ["Sevilla", "Cádiz", "Granada", "Madrid"],
        answer: "Granada",
      },
      {
        id: "q2",
        prompt: { en: "What is Sevilla known for in the text?", sv: "Vad är Sevilla känt för i texten?" },
        options: ["Beaches", "Flamenco music", "Mountains", "Museums"],
        answer: "Flamenco music",
      },
      {
        id: "q3",
        prompt: { en: "How did the narrator feel coming home?", sv: "Hur kände sig berättaren när hen kom hem?" },
        options: ["Sad", "Disappointed", "Tired but happy", "Bored"],
        answer: "Tired but happy",
      },
    ],
  },
  {
    id: "b1-amigos",
    level: "B1",
    title: { en: "Friends from school", sv: "Vänner från skolan" },
    text:
      "Cuando estaba en la escuela tenía un grupo de cinco amigos. Pasábamos las tardes jugando al fútbol en el parque y los fines de semana íbamos al cine. Hoy en día vivimos en ciudades diferentes, pero nos llamamos cada mes y una vez al año nos reunimos para celebrar nuestra amistad.",
    translation: {
      en: "When I was at school I had a group of five friends. We used to spend afternoons playing football in the park and on weekends we went to the cinema. These days we live in different cities, but we call each other every month and once a year we get together to celebrate our friendship.",
      sv: "När jag gick i skolan hade jag en grupp på fem vänner. Vi tillbringade eftermiddagarna med att spela fotboll i parken och på helgerna gick vi på bio. Numera bor vi i olika städer, men vi ringer varandra varje månad och en gång om året träffas vi för att fira vår vänskap.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "How many friends were in the group?", sv: "Hur många vänner var i gruppen?" },
        options: ["Three", "Four", "Five", "Six"],
        answer: "Five",
      },
      {
        id: "q2",
        prompt: { en: "What did they do on weekends?", sv: "Vad gjorde de på helgerna?" },
        options: ["Played football", "Went to the cinema", "Studied together", "Travelled"],
        answer: "Went to the cinema",
      },
      {
        id: "q3",
        prompt: { en: "How often do they meet now?", sv: "Hur ofta träffas de nu?" },
        options: ["Every week", "Every month", "Once a year", "Never"],
        answer: "Once a year",
      },
    ],
  },

  // ─────────────────────────────────────── B2 ───────────────────────────────────────
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
  {
    id: "b2-tecnologia",
    level: "B2",
    title: { en: "Technology and society", sv: "Teknik och samhälle" },
    text:
      "La inteligencia artificial está transformando muchos sectores, desde la medicina hasta la educación. Aunque ofrece ventajas evidentes, como diagnósticos más rápidos y aprendizaje personalizado, también plantea preguntas éticas serias. ¿Quién es responsable cuando una máquina comete un error? Los expertos coinciden en que necesitamos regulaciones claras antes de que la tecnología avance demasiado.",
    translation: {
      en: "Artificial intelligence is transforming many sectors, from medicine to education. Although it offers clear advantages, like faster diagnoses and personalised learning, it also raises serious ethical questions. Who is responsible when a machine makes a mistake? Experts agree that we need clear regulations before the technology moves too far ahead.",
      sv: "Artificiell intelligens förändrar många sektorer, från medicin till utbildning. Även om den erbjuder tydliga fördelar, som snabbare diagnoser och individanpassat lärande, väcker den också allvarliga etiska frågor. Vem är ansvarig när en maskin gör fel? Experter är överens om att vi behöver tydliga regler innan tekniken går för långt.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "Which sectors does the text mention?", sv: "Vilka sektorer nämns i texten?" },
        options: ["Sports and tourism", "Medicine and education", "Agriculture and music", "Fashion and finance"],
        answer: "Medicine and education",
      },
      {
        id: "q2",
        prompt: { en: "What do experts say is needed?", sv: "Vad säger experter behövs?" },
        options: ["More research grants", "Clear regulations", "Public protests", "Lower prices"],
        answer: "Clear regulations",
      },
      {
        id: "q3",
        prompt: { en: "What ethical question does the text raise?", sv: "Vilken etisk fråga tar texten upp?" },
        options: [
          "Whether AI should be free",
          "Who is responsible when a machine errs",
          "Whether AI is fast enough",
          "Whether AI should learn languages",
        ],
        answer: "Who is responsible when a machine errs",
      },
    ],
  },
  {
    id: "b2-comida",
    level: "B2",
    title: { en: "The Mediterranean diet", sv: "Medelhavskosten" },
    text:
      "La dieta mediterránea, declarada Patrimonio Cultural Inmaterial por la UNESCO, se basa en el consumo abundante de frutas, verduras, legumbres y aceite de oliva. Diversos estudios han demostrado que esta forma de alimentarse reduce el riesgo de enfermedades cardíacas y prolonga la esperanza de vida. Sin embargo, el ritmo acelerado de la vida moderna está cambiando los hábitos alimenticios de los más jóvenes.",
    translation: {
      en: "The Mediterranean diet, declared Intangible Cultural Heritage by UNESCO, is based on plentiful fruits, vegetables, legumes, and olive oil. Several studies have shown that eating this way reduces the risk of heart disease and increases life expectancy. However, the fast pace of modern life is changing the eating habits of younger generations.",
      sv: "Medelhavskosten, som av UNESCO utsetts till immateriellt kulturarv, bygger på rikliga mängder frukt, grönsaker, baljväxter och olivolja. Flera studier har visat att den här typen av kost minskar risken för hjärtsjukdomar och förlänger den förväntade livslängden. Det moderna livets snabba tempo håller dock på att förändra de yngres matvanor.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "Who recognised the diet as cultural heritage?", sv: "Vem utsåg kosten till kulturarv?" },
        options: ["The EU", "WHO", "UNESCO", "FAO"],
        answer: "UNESCO",
      },
      {
        id: "q2",
        prompt: { en: "What health benefit is mentioned?", sv: "Vilken hälsofördel nämns?" },
        options: ["Better eyesight", "Reduced heart disease risk", "Stronger bones", "Better sleep"],
        answer: "Reduced heart disease risk",
      },
      {
        id: "q3",
        prompt: { en: "What threatens the diet, according to the text?", sv: "Vad hotar kosten enligt texten?" },
        options: ["Bad weather", "Modern fast-paced life", "Government rules", "High prices"],
        answer: "Modern fast-paced life",
      },
    ],
  },

  // ─────────────────────────────────────── C1 ───────────────────────────────────────
  {
    id: "c1-arte",
    level: "C1",
    title: { en: "Art in public spaces", sv: "Konst i offentliga rum" },
    text:
      "El arte urbano ha dejado de ser un fenómeno marginal para convertirse en una manifestación cultural reconocida en todo el mundo. Lo que antes se consideraba simple vandalismo es ahora objeto de exposiciones, libros y rutas turísticas. No obstante, persiste un debate acalorado: ¿hasta qué punto la institucionalización de este arte traiciona su esencia rebelde? Para algunos artistas, vender una obra a un museo equivale a renunciar al espíritu original del movimiento.",
    translation: {
      en: "Urban art has gone from a marginal phenomenon to a culturally recognised expression worldwide. What was once considered mere vandalism is now the subject of exhibitions, books, and tourist routes. However, a heated debate persists: to what extent does institutionalising this art betray its rebellious essence? For some artists, selling a piece to a museum amounts to giving up the movement's original spirit.",
      sv: "Gatukonsten har gått från att vara ett marginalfenomen till ett kulturellt erkänt uttryck över hela världen. Det som tidigare ansågs vara ren vandalisering blir nu föremål för utställningar, böcker och turistrundor. Det pågår dock en hetsig debatt: i vilken utsträckning förråder institutionaliseringen av denna konst dess upproriska kärna? För vissa konstnärer innebär det att sälja ett verk till ett museum att de överger rörelsens ursprungliga anda.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "How is urban art described today?", sv: "Hur beskrivs gatukonsten idag?" },
        options: [
          "Still considered vandalism",
          "A recognised cultural expression",
          "An illegal activity",
          "A passing trend",
        ],
        answer: "A recognised cultural expression",
      },
      {
        id: "q2",
        prompt: { en: "What is the heated debate about?", sv: "Vad handlar den hetsiga debatten om?" },
        options: [
          "The price of artworks",
          "Whether institutionalisation betrays its essence",
          "The colours used by artists",
          "How to teach it in schools",
        ],
        answer: "Whether institutionalisation betrays its essence",
      },
      {
        id: "q3",
        prompt: { en: "How do some artists view museum sales?", sv: "Hur ser vissa konstnärer på museiförsäljning?" },
        options: [
          "As a personal triumph",
          "As irrelevant",
          "As betraying the movement's spirit",
          "As a financial necessity",
        ],
        answer: "As betraying the movement's spirit",
      },
    ],
  },
  {
    id: "c1-economia",
    level: "C1",
    title: { en: "The gig economy", sv: "Gig-ekonomin" },
    text:
      "La llamada economía colaborativa ha alterado profundamente el mercado laboral. Plataformas digitales permiten ofrecer servicios de transporte, alojamiento o reparto sin la rigidez de un contrato tradicional. Si bien esto otorga flexibilidad a quienes valoran la autonomía, también deja a muchos trabajadores sin las protecciones básicas que el empleo formal solía garantizar. Diversos gobiernos exploran ahora marcos jurídicos intermedios capaces de equilibrar innovación y derechos laborales.",
    translation: {
      en: "The so-called sharing economy has profoundly altered the labour market. Digital platforms make it possible to offer transport, lodging, or delivery services without the rigidity of a traditional contract. While this gives flexibility to those who value autonomy, it also leaves many workers without the basic protections formal employment used to guarantee. Various governments are now exploring intermediate legal frameworks capable of balancing innovation with labour rights.",
      sv: "Den så kallade delningsekonomin har djupt förändrat arbetsmarknaden. Digitala plattformar gör det möjligt att erbjuda transporter, boende eller bud utan ett traditionellt anställningsavtals stelhet. Även om detta ger flexibilitet åt dem som värdesätter självständighet lämnar det också många arbetare utan de grundläggande skydd som formell anställning brukade garantera. Flera regeringar undersöker nu mellanliggande juridiska ramverk som kan balansera innovation och arbetstagarrättigheter.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What enables sharing-economy services?", sv: "Vad möjliggör delningsekonomins tjänster?" },
        options: ["Strict union rules", "Digital platforms", "Government subsidies", "Long-term contracts"],
        answer: "Digital platforms",
      },
      {
        id: "q2",
        prompt: { en: "What downside is highlighted?", sv: "Vilken nackdel lyfts fram?" },
        options: [
          "High costs for consumers",
          "Lack of basic worker protections",
          "Lack of innovation",
          "Slow service",
        ],
        answer: "Lack of basic worker protections",
      },
      {
        id: "q3",
        prompt: { en: "What are governments doing?", sv: "Vad gör regeringar?" },
        options: [
          "Banning these platforms",
          "Ignoring the issue",
          "Exploring intermediate legal frameworks",
          "Subsidising companies",
        ],
        answer: "Exploring intermediate legal frameworks",
      },
    ],
  },
  {
    id: "c1-educacion",
    level: "C1",
    title: { en: "Rethinking education", sv: "Att tänka om utbildningen" },
    text:
      "Cada vez más expertos sostienen que el modelo educativo tradicional, basado en clases magistrales y exámenes memorísticos, no responde a las necesidades del mundo actual. Proponen, en cambio, métodos centrados en el estudiante: aprendizaje por proyectos, evaluación continua y desarrollo de competencias transversales como el pensamiento crítico. Sin embargo, llevar estas ideas a la práctica exige formación docente, recursos y un cambio cultural que no siempre las administraciones están dispuestas a asumir.",
    translation: {
      en: "More and more experts argue that the traditional educational model, based on lectures and memorisation tests, no longer answers the needs of today's world. Instead, they propose student-centred methods: project-based learning, continuous assessment, and the development of cross-cutting competences such as critical thinking. However, putting these ideas into practice demands teacher training, resources, and a cultural shift that administrations are not always willing to take on.",
      sv: "Allt fler experter hävdar att den traditionella undervisningsmodellen, baserad på katederundervisning och inläsningsprov, inte svarar mot dagens behov. De föreslår i stället elevcentrerade metoder: projektbaserat lärande, kontinuerlig bedömning och utveckling av övergripande kompetenser som kritiskt tänkande. Att omsätta dessa idéer i praktiken kräver dock lärarfortbildning, resurser och en kulturförändring som myndigheterna inte alltid är beredda att ta på sig.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What does the traditional model rely on?", sv: "Vad bygger den traditionella modellen på?" },
        options: [
          "Group projects",
          "Lectures and memorisation tests",
          "Online quizzes",
          "Field trips",
        ],
        answer: "Lectures and memorisation tests",
      },
      {
        id: "q2",
        prompt: { en: "Which competence is given as an example?", sv: "Vilken kompetens ges som exempel?" },
        options: ["Calligraphy", "Critical thinking", "Sports skills", "Singing"],
        answer: "Critical thinking",
      },
      {
        id: "q3",
        prompt: { en: "What is needed to apply the new methods?", sv: "Vad krävs för att tillämpa de nya metoderna?" },
        options: [
          "Bigger classrooms",
          "Teacher training and resources",
          "Stricter exams",
          "More homework",
        ],
        answer: "Teacher training and resources",
      },
    ],
  },

  // ─────────────────────────────────────── C2 ───────────────────────────────────────
  {
    id: "c2-literatura",
    level: "C2",
    title: { en: "The legacy of magical realism", sv: "Den magiska realismens arv" },
    text:
      "El realismo mágico, consagrado por autores como Gabriel García Márquez y Juan Rulfo, no se limita a insertar elementos sobrenaturales en escenarios cotidianos: constituye, en rigor, una forma de interpretar la realidad latinoamericana, donde lo extraordinario y lo mundano conviven sin estridencias. Décadas después de Cien años de soledad, su influencia se rastrea en cinematografías tan dispares como la mexicana o la coreana, prueba inequívoca de que su poética desborda fronteras geográficas y supera, con creces, las modas literarias.",
    translation: {
      en: "Magical realism, enshrined by authors such as Gabriel García Márquez and Juan Rulfo, does not merely insert supernatural elements into everyday settings: strictly speaking, it constitutes a way of interpreting Latin American reality, where the extraordinary and the mundane coexist without fuss. Decades after One Hundred Years of Solitude, its influence can be traced in cinemas as different as the Mexican and the Korean, unambiguous proof that its poetics overflow geographic borders and easily outlast literary fashions.",
      sv: "Den magiska realismen, kanoniserad av författare som Gabriel García Márquez och Juan Rulfo, nöjer sig inte med att lägga in övernaturliga inslag i vardagliga miljöer: den utgör i strikt mening ett sätt att tolka den latinamerikanska verkligheten, där det utomordentliga och det vardagliga lever sida vid sida utan dramatik. Decennier efter Hundra år av ensamhet kan dess inflytande spåras i så olika filmtraditioner som den mexikanska och den koreanska — ett otvetydigt bevis på att dess poetik spränger geografiska gränser och med god marginal överlever litterära modeväxlingar.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What does the text say magical realism really is?", sv: "Vad säger texten att magisk realism egentligen är?" },
        options: [
          "Just supernatural decoration",
          "A way of interpreting reality",
          "A children's genre",
          "A film movement",
        ],
        answer: "A way of interpreting reality",
      },
      {
        id: "q2",
        prompt: { en: "Which two cinemas are contrasted as examples?", sv: "Vilka två filmtraditioner ställs mot varandra som exempel?" },
        options: ["Spanish and Italian", "Mexican and Korean", "French and Japanese", "Argentine and Brazilian"],
        answer: "Mexican and Korean",
      },
      {
        id: "q3",
        prompt: { en: "What does the author conclude about its influence?", sv: "Vad slår författaren fast om dess inflytande?" },
        options: [
          "It is fading quickly",
          "It only matters in literature",
          "It crosses borders and outlasts trends",
          "It depends on translation",
        ],
        answer: "It crosses borders and outlasts trends",
      },
    ],
  },
  {
    id: "c2-filosofia",
    level: "C2",
    title: { en: "Identity in the digital age", sv: "Identitet i den digitala tidsåldern" },
    text:
      "Si en otras épocas la identidad personal se forjaba al calor del barrio, la familia o el oficio, hoy se construye, con frecuencia, frente a una pantalla. Las redes sociales no se limitan a reflejar quiénes somos: nos invitan, sutilmente, a editarnos. Esta curaduría incesante del yo, aunque puede entenderse como una forma de libertad expresiva, encubre una paradoja inquietante: cuanto más visibles nos volvemos, más difícil resulta saber dónde termina la persona y dónde empieza el personaje. Reflexionar sobre esta tensión es, quizá, la tarea filosófica más urgente de nuestro tiempo.",
    translation: {
      en: "If in other eras personal identity was forged in the warmth of the neighbourhood, the family, or one's trade, today it is often built in front of a screen. Social networks do not merely reflect who we are: they subtly invite us to edit ourselves. This incessant curation of the self, while it can be read as a form of expressive freedom, conceals a disturbing paradox: the more visible we become, the harder it gets to tell where the person ends and the persona begins. Reflecting on this tension is perhaps the most urgent philosophical task of our time.",
      sv: "Om identiteten i tidigare epoker formades i värmen av kvarteret, familjen eller yrket, byggs den i dag ofta framför en skärm. Sociala medier nöjer sig inte med att spegla vilka vi är: de bjuder oss subtilt in att redigera oss själva. Denna oavbrutna kuratering av jaget, även om den kan ses som ett slags uttrycksfrihet, döljer en oroande paradox: ju synligare vi blir, desto svårare blir det att avgöra var personen slutar och rollen börjar. Att reflektera över denna spänning är kanske vår tids mest brådskande filosofiska uppgift.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "Where was identity formed in the past, per the text?", sv: "Var formades identiteten förr enligt texten?" },
        options: [
          "Only at school",
          "In the neighbourhood, family, and trade",
          "Mostly in books",
          "On the radio",
        ],
        answer: "In the neighbourhood, family, and trade",
      },
      {
        id: "q2",
        prompt: { en: "What paradox does the author highlight?", sv: "Vilken paradox lyfter författaren fram?" },
        options: [
          "More visibility blurs person vs. persona",
          "Fewer friends online means more freedom",
          "Privacy increases with sharing",
          "Networks reduce self-expression",
        ],
        answer: "More visibility blurs person vs. persona",
      },
      {
        id: "q3",
        prompt: { en: "How does the author frame this issue?", sv: "Hur ramar författaren in denna fråga?" },
        options: [
          "A trivial concern",
          "A purely technical problem",
          "Our era's most urgent philosophical task",
          "A passing media trend",
        ],
        answer: "Our era's most urgent philosophical task",
      },
    ],
  },
  {
    id: "c2-historia",
    level: "C2",
    title: { en: "Reading history critically", sv: "Att läsa historien kritiskt" },
    text:
      "La historiografía contemporánea ha abandonado, en buena medida, la pretensión de objetividad absoluta que caracterizó al positivismo decimonónico. Hoy se admite que toda narración histórica responde, consciente o inconscientemente, a los intereses, prejuicios y omisiones de quien la escribe. Lejos de relativizar el conocimiento, esta lucidez metodológica enriquece el debate académico: invita a contrastar fuentes, a dar voz a los perdedores y a desmontar relatos hegemónicos que durante siglos parecieron incuestionables.",
    translation: {
      en: "Contemporary historiography has largely abandoned the claim to absolute objectivity that characterised nineteenth-century positivism. It is now accepted that every historical account responds, consciously or unconsciously, to the interests, prejudices, and omissions of whoever writes it. Far from relativising knowledge, this methodological lucidity enriches academic debate: it invites us to compare sources, give voice to the losers, and dismantle hegemonic narratives that for centuries seemed unquestionable.",
      sv: "Den samtida historieskrivningen har till stor del övergett anspråket på absolut objektivitet som präglade 1800-talets positivism. Idag godtas att varje historisk berättelse, medvetet eller omedvetet, svarar mot författarens intressen, fördomar och utelämnanden. Långt ifrån att relativisera kunskapen berikar denna metodologiska klarsyn den akademiska debatten: den bjuder in oss att jämföra källor, ge röst åt förlorarna och plocka isär hegemoniska berättelser som under århundraden verkade odiskutabla.",
    },
    questions: [
      {
        id: "q1",
        prompt: { en: "What has contemporary historiography largely abandoned?", sv: "Vad har den samtida historieskrivningen till stor del övergett?" },
        options: [
          "The use of primary sources",
          "Claims of absolute objectivity",
          "Academic peer review",
          "Chronological order",
        ],
        answer: "Claims of absolute objectivity",
      },
      {
        id: "q2",
        prompt: { en: "What does the author say enriches debate?", sv: "Vad säger författaren berikar debatten?" },
        options: [
          "Methodological lucidity",
          "Stronger national narratives",
          "Less source criticism",
          "Removing footnotes",
        ],
        answer: "Methodological lucidity",
      },
      {
        id: "q3",
        prompt: { en: "Whose voices does the new approach amplify?", sv: "Vems röster lyfter det nya angreppssättet fram?" },
        options: [
          "The winners' voices only",
          "The losers' voices",
          "No one's in particular",
          "Only the historians' voices",
        ],
        answer: "The losers' voices",
      },
    ],
  },
];
