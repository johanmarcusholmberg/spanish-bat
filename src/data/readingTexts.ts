import { Level } from "@/contexts/AuthContext";

export interface ReadingText {
  id: string;
  title: { sv: string; en: string };
  level: Level;
  text: string;
  questions: {
    question: { sv: string; en: string };
    options: string[];
    correctIndex: number;
  }[];
}

export const readingTexts: ReadingText[] = [
  // A1
  {
    id: "mi-familia",
    title: { sv: "Min familj", en: "My family" },
    level: "A1",
    text: `Me llamo Ana. Tengo veinticinco años y vivo en Madrid. Mi familia es grande. Tengo dos hermanos: Pedro y Luis. Pedro tiene treinta años y es profesor. Luis tiene veinte años y es estudiante. Mi madre se llama Carmen y mi padre se llama José. Ellos viven en Barcelona. Tengo un perro que se llama Max. Es pequeño y muy simpático. Los fines de semana visito a mi familia en Barcelona.`,
    questions: [
      {
        question: { sv: "Var bor Ana?", en: "Where does Ana live?" },
        options: ["Barcelona", "Madrid", "Valencia", "Sevilla"],
        correctIndex: 1,
      },
      {
        question: { sv: "Vad heter Anas hund?", en: "What is Ana's dog called?" },
        options: ["Pedro", "Luis", "Max", "José"],
        correctIndex: 2,
      },
      {
        question: { sv: "Hur många syskon har Ana?", en: "How many siblings does Ana have?" },
        options: ["Uno", "Dos", "Tres", "Cuatro"],
        correctIndex: 1,
      },
      {
        question: { sv: "Vad jobbar Pedro med?", en: "What does Pedro do?" },
        options: ["Estudiante", "Médico", "Profesor", "Cocinero"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "un-dia-normal",
    title: { sv: "En vanlig dag", en: "A normal day" },
    level: "A1",
    text: `Todos los días me levanto a las siete de la mañana. Primero, me ducho y me visto. Después, desayuno café con leche y tostadas. A las ocho y media, voy al trabajo en autobús. Trabajo en una oficina. A las dos de la tarde, como en un restaurante cerca de la oficina. Por la tarde, trabajo hasta las seis. Después del trabajo, voy al gimnasio. Por la noche, ceno en casa y veo la televisión. Me acuesto a las once.`,
    questions: [
      {
        question: { sv: "Hur tar sig personen till jobbet?", en: "How does the person get to work?" },
        options: ["En coche", "En bicicleta", "En autobús", "A pie"],
        correctIndex: 2,
      },
      {
        question: { sv: "Vad gör personen efter jobbet?", en: "What does the person do after work?" },
        options: ["Estudiar", "Ir al gimnasio", "Ir al cine", "Cocinar"],
        correctIndex: 1,
      },
      {
        question: { sv: "När lägger sig personen?", en: "When does the person go to bed?" },
        options: ["A las nueve", "A las diez", "A las once", "A las doce"],
        correctIndex: 2,
      },
    ],
  },
  // A2
  {
    id: "vacaciones-playa",
    title: { sv: "Semester vid stranden", en: "Beach vacation" },
    level: "A2",
    text: `El verano pasado fui de vacaciones a Málaga con mis amigos. Viajamos en tren desde Madrid y el viaje duró dos horas y media. Nos alojamos en un hotel cerca de la playa. Todos los días nos levantábamos tarde y desayunábamos en la terraza del hotel. Por las mañanas íbamos a la playa y nadábamos en el mar. El agua estaba muy caliente. Por las tardes visitábamos la ciudad y comprábamos recuerdos. Una noche fuimos a un restaurante de mariscos y probé la paella por primera vez. ¡Estaba deliciosa! Fue unas vacaciones perfectas.`,
    questions: [
      {
        question: { sv: "Hur reste de till Málaga?", en: "How did they travel to Málaga?" },
        options: ["En avión", "En coche", "En tren", "En autobús"],
        correctIndex: 2,
      },
      {
        question: { sv: "Vad provade berättaren för första gången?", en: "What did the narrator try for the first time?" },
        options: ["Gazpacho", "Paella", "Tortilla", "Sangría"],
        correctIndex: 1,
      },
      {
        question: { sv: "Hur var vattnet?", en: "How was the water?" },
        options: ["Frío", "Muy caliente", "Templado", "Sucio"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "nueva-ciudad",
    title: { sv: "Ny i staden", en: "New in the city" },
    level: "A2",
    text: `Me mudé a Sevilla hace tres meses para trabajar. Al principio fue difícil porque no conocía a nadie. Mi apartamento es pequeño pero bonito, está en el centro de la ciudad. Poco a poco empecé a conocer a mis vecinos. Mi vecina Laura es muy amable y me invitó a tomar café. También me apunté a un curso de flamenco para conocer gente nueva. Ahora tengo varios amigos y me encanta vivir aquí. Sevilla es una ciudad muy bonita con mucha historia y buena comida.`,
    questions: [
      {
        question: { sv: "Varför flyttade berättaren till Sevilla?", en: "Why did the narrator move to Sevilla?" },
        options: ["Para estudiar", "Para trabajar", "Para la familia", "Para el clima"],
        correctIndex: 1,
      },
      {
        question: { sv: "Vad anmälde sig berättaren till?", en: "What did the narrator sign up for?" },
        options: ["Curso de español", "Curso de cocina", "Curso de flamenco", "Curso de pintura"],
        correctIndex: 2,
      },
    ],
  },
  // B1
  {
    id: "medio-ambiente",
    title: { sv: "Miljön", en: "The environment" },
    level: "B1",
    text: `El cambio climático es uno de los problemas más graves de nuestro tiempo. Cada año las temperaturas suben, los glaciares se derriten y el nivel del mar aumenta. Muchos científicos dicen que si no actuamos pronto, las consecuencias serán devastadoras. Hay muchas cosas que podemos hacer en nuestra vida diaria para ayudar. Podemos reducir el uso de plástico, reciclar, usar transporte público y ahorrar energía en casa. También es importante que los gobiernos tomen medidas más fuertes. Algunos países ya están invirtiendo en energías renovables como la solar y la eólica. España, por ejemplo, es uno de los países europeos con más horas de sol y tiene un gran potencial para la energía solar.`,
    questions: [
      {
        question: { sv: "Vad händer med glaciärerna?", en: "What is happening to the glaciers?" },
        options: ["Crecen", "Se derriten", "Se congelan más", "No cambian"],
        correctIndex: 1,
      },
      {
        question: { sv: "Vilken förnybar energi nämns som lämplig för Spanien?", en: "Which renewable energy is mentioned as suitable for Spain?" },
        options: ["Eólica", "Nuclear", "Solar", "Hidroeléctrica"],
        correctIndex: 2,
      },
      {
        question: { sv: "Vad kan individer göra enligt texten?", en: "What can individuals do according to the text?" },
        options: ["Solo esperar", "Reducir plástico y reciclar", "No hacer nada", "Comprar más cosas"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "tecnologia-vida",
    title: { sv: "Teknologi i vardagen", en: "Technology in daily life" },
    level: "B1",
    text: `La tecnología ha cambiado completamente nuestra forma de vivir. Hace veinte años, la mayoría de la gente no tenía teléfono móvil ni acceso a internet. Hoy en día, usamos el móvil para casi todo: comunicarnos, trabajar, comprar, aprender idiomas y hasta cocinar siguiendo recetas en línea. Las redes sociales nos permiten estar en contacto con amigos y familiares en todo el mundo. Sin embargo, muchos expertos advierten que pasar demasiado tiempo frente a las pantallas puede afectar nuestra salud mental. Es importante encontrar un equilibrio y dedicar tiempo a actividades al aire libre y a las relaciones personales cara a cara.`,
    questions: [
      {
        question: { sv: "Vad hade de flesta inte för tjugo år sedan?", en: "What didn't most people have twenty years ago?" },
        options: ["Televisión", "Teléfono móvil e internet", "Radio", "Periódicos"],
        correctIndex: 1,
      },
      {
        question: { sv: "Vad varnar experterna för?", en: "What do experts warn about?" },
        options: ["Usar poco el móvil", "Demasiado tiempo frente a pantallas", "No usar redes sociales", "Cocinar en línea"],
        correctIndex: 1,
      },
    ],
  },
  // B2
  {
    id: "historia-espana",
    title: { sv: "Spaniens moderna historia", en: "Spain's modern history" },
    level: "B2",
    text: `La historia moderna de España está marcada por profundos cambios políticos y sociales. Tras casi cuatro décadas de dictadura bajo Francisco Franco (1939-1975), el país inició una transición hacia la democracia que se considera ejemplar en el mundo. El rey Juan Carlos I desempeñó un papel fundamental en este proceso, y la Constitución de 1978 estableció España como una monarquía parlamentaria. Desde entonces, el país ha experimentado una notable transformación económica y social. La entrada en la Unión Europea en 1986 aceleró la modernización del país. Sin embargo, la crisis económica de 2008 golpeó duramente a España, con tasas de desempleo que superaron el 25%. A pesar de estas dificultades, España ha demostrado una notable capacidad de recuperación y sigue siendo una de las principales economías europeas.`,
    questions: [
      {
        question: { sv: "När antogs den spanska konstitutionen?", en: "When was the Spanish constitution adopted?" },
        options: ["1975", "1978", "1986", "2008"],
        correctIndex: 1,
      },
      {
        question: { sv: "När gick Spanien med i EU?", en: "When did Spain join the EU?" },
        options: ["1978", "1982", "1986", "1992"],
        correctIndex: 2,
      },
      {
        question: { sv: "Hur hög var arbetslösheten under krisen 2008?", en: "How high was unemployment during the 2008 crisis?" },
        options: ["10%", "15%", "20%", "Más del 25%"],
        correctIndex: 3,
      },
    ],
  },
  // C1
  {
    id: "arte-espanol",
    title: { sv: "Spansk konst genom tiderna", en: "Spanish art through the ages" },
    level: "C1",
    text: `España ha sido cuna de algunos de los artistas más influyentes de la historia del arte occidental. Desde las misteriosas pinturas rupestres de Altamira, pasando por la intensidad dramática de El Greco, hasta la genialidad subversiva de Goya, el arte español siempre ha reflejado una profunda conexión con la condición humana. En el siglo XX, figuras como Pablo Picasso, Salvador Dalí y Joan Miró revolucionaron el panorama artístico internacional. Picasso, con su Guernica, creó posiblemente la obra antibelicista más poderosa jamás pintada, mientras que Dalí exploró los territorios del subconsciente con una precisión técnica asombrosa. La tradición artística española contemporánea sigue viva con artistas como Antoni Tàpies, quien desafió las convenciones del arte matérico, y más recientemente, Jaume Plensa, cuyas esculturas monumentales dialogan con el espacio público de ciudades de todo el mundo.`,
    questions: [
      {
        question: { sv: "Vilken konstnär skapade Guernica?", en: "Which artist created Guernica?" },
        options: ["Dalí", "Miró", "Picasso", "Goya"],
        correctIndex: 2,
      },
      {
        question: { sv: "Vad utforskade Dalí i sin konst?", en: "What did Dalí explore in his art?" },
        options: ["La naturaleza", "El subconsciente", "La política", "La religión"],
        correctIndex: 1,
      },
      {
        question: { sv: "Vem nämns som samtida skulptör?", en: "Who is mentioned as a contemporary sculptor?" },
        options: ["Tàpies", "Plensa", "Miró", "El Greco"],
        correctIndex: 1,
      },
    ],
  },
];
