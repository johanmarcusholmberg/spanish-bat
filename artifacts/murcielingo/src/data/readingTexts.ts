import { Level } from "@/contexts/AuthContext";

export interface ReadingText {
  id: string;
  title: { sv: string; en: string };
  level: Level;
  text: string;
  topic: string;
  grammarFocus?: string;
  difficulty: number; // 1-3 within level
  questions: {
    question: { sv: string; en: string };
    options: string[];
    correctIndex: number;
  }[];
}

export const readingTexts: ReadingText[] = [
  // ===== A1 =====
  {
    id: "mi-familia",
    title: { sv: "Min familj", en: "My family" },
    level: "A1",
    topic: "family",
    grammarFocus: "present tense, ser/tener",
    difficulty: 1,
    text: `Me llamo Ana. Tengo veinticinco años y vivo en Madrid. Mi familia es grande. Tengo dos hermanos: Pedro y Luis. Pedro tiene treinta años y es profesor. Luis tiene veinte años y es estudiante. Mi madre se llama Carmen y mi padre se llama José. Ellos viven en Barcelona. Tengo un perro que se llama Max. Es pequeño y muy simpático. Los fines de semana visito a mi familia en Barcelona.`,
    questions: [
      { question: { sv: "Var bor Ana?", en: "Where does Ana live?" }, options: ["Barcelona", "Madrid", "Valencia", "Sevilla"], correctIndex: 1 },
      { question: { sv: "Vad heter Anas hund?", en: "What is Ana's dog called?" }, options: ["Pedro", "Luis", "Max", "José"], correctIndex: 2 },
      { question: { sv: "Hur många syskon har Ana?", en: "How many siblings does Ana have?" }, options: ["Uno", "Dos", "Tres", "Cuatro"], correctIndex: 1 },
      { question: { sv: "Vad jobbar Pedro med?", en: "What does Pedro do?" }, options: ["Estudiante", "Médico", "Profesor", "Cocinero"], correctIndex: 2 },
    ],
  },
  {
    id: "un-dia-normal",
    title: { sv: "En vanlig dag", en: "A normal day" },
    level: "A1",
    topic: "daily routine",
    grammarFocus: "reflexive verbs, present tense",
    difficulty: 2,
    text: `Todos los días me levanto a las siete de la mañana. Primero, me ducho y me visto. Después, desayuno café con leche y tostadas. A las ocho y media, voy al trabajo en autobús. Trabajo en una oficina. A las dos de la tarde, como en un restaurante cerca de la oficina. Por la tarde, trabajo hasta las seis. Después del trabajo, voy al gimnasio. Por la noche, ceno en casa y veo la televisión. Me acuesto a las once.`,
    questions: [
      { question: { sv: "Hur tar sig personen till jobbet?", en: "How does the person get to work?" }, options: ["En coche", "En bicicleta", "En autobús", "A pie"], correctIndex: 2 },
      { question: { sv: "Vad gör personen efter jobbet?", en: "What does the person do after work?" }, options: ["Estudiar", "Ir al gimnasio", "Ir al cine", "Cocinar"], correctIndex: 1 },
      { question: { sv: "När lägger sig personen?", en: "When does the person go to bed?" }, options: ["A las nueve", "A las diez", "A las once", "A las doce"], correctIndex: 2 },
    ],
  },
  {
    id: "mi-casa",
    title: { sv: "Mitt hus", en: "My house" },
    level: "A1",
    topic: "home",
    grammarFocus: "hay, estar, descriptions",
    difficulty: 1,
    text: `Vivo en un apartamento pequeño en el centro de la ciudad. Mi apartamento tiene tres habitaciones: un dormitorio, un salón y una cocina. El baño es pequeño pero bonito. En el salón hay un sofá grande y una televisión. En la cocina hay una mesa con cuatro sillas. Mi dormitorio tiene una cama, un armario y una ventana grande. Me gusta mi apartamento porque es muy luminoso.`,
    questions: [
      { question: { sv: "Var ligger lägenheten?", en: "Where is the apartment?" }, options: ["En las afueras", "En el centro", "En la playa", "En el campo"], correctIndex: 1 },
      { question: { sv: "Hur många rum har lägenheten?", en: "How many rooms does the apartment have?" }, options: ["Dos", "Tres", "Cuatro", "Cinco"], correctIndex: 1 },
      { question: { sv: "Varför gillar personen sin lägenhet?", en: "Why does the person like their apartment?" }, options: ["Es grande", "Es barato", "Es luminoso", "Es nuevo"], correctIndex: 2 },
    ],
  },
  {
    id: "en-el-mercado",
    title: { sv: "På marknaden", en: "At the market" },
    level: "A1",
    topic: "shopping",
    grammarFocus: "querer, poder, numbers",
    difficulty: 2,
    text: `Hoy es sábado y voy al mercado con mi madre. En el mercado hay muchas frutas y verduras. Compramos tomates, naranjas, plátanos y lechuga. Mi madre compra también pan y queso. Yo quiero comprar chocolate pero mi madre dice que no. El mercado es grande y tiene muchos colores. Hay un señor que vende pescado fresco. Todo es muy barato. Me gusta ir al mercado porque hay mucha gente y es divertido.`,
    questions: [
      { question: { sv: "Vilken dag är det?", en: "What day is it?" }, options: ["Lunes", "Viernes", "Sábado", "Domingo"], correctIndex: 2 },
      { question: { sv: "Vad vill berättaren köpa?", en: "What does the narrator want to buy?" }, options: ["Pescado", "Chocolate", "Pan", "Fruta"], correctIndex: 1 },
      { question: { sv: "Hur är priserna?", en: "How are the prices?" }, options: ["Caros", "Normales", "Baratos", "Gratis"], correctIndex: 2 },
    ],
  },
  {
    id: "mis-amigos",
    title: { sv: "Mina vänner", en: "My friends" },
    level: "A1",
    topic: "friendship",
    grammarFocus: "ser, adjectives, likes",
    difficulty: 3,
    text: `Tengo tres amigos muy buenos. Mi mejor amiga se llama Sofía. Ella es alta, tiene el pelo largo y negro. A Sofía le gusta mucho la música y toca la guitarra. Mi amigo Carlos es muy divertido. Él es bajo y tiene gafas. A Carlos le gusta el fútbol y juega todos los sábados. Mi otro amigo se llama David. David es tranquilo y muy inteligente. A él le gustan los libros y las películas. Juntos vamos al cine los viernes por la noche.`,
    questions: [
      { question: { sv: "Vad spelar Sofía?", en: "What does Sofía play?" }, options: ["El piano", "La guitarra", "El violín", "La flauta"], correctIndex: 1 },
      { question: { sv: "Vad gillar Carlos?", en: "What does Carlos like?" }, options: ["La música", "Los libros", "El fútbol", "El cine"], correctIndex: 2 },
      { question: { sv: "Vad gör de tillsammans på fredagar?", en: "What do they do together on Fridays?" }, options: ["Jugar fútbol", "Ir al cine", "Tocar música", "Estudiar"], correctIndex: 1 },
    ],
  },

  // ===== A2 =====
  {
    id: "vacaciones-playa",
    title: { sv: "Semester vid stranden", en: "Beach vacation" },
    level: "A2",
    topic: "travel",
    grammarFocus: "preterite, imperfect",
    difficulty: 1,
    text: `El verano pasado fui de vacaciones a Málaga con mis amigos. Viajamos en tren desde Madrid y el viaje duró dos horas y media. Nos alojamos en un hotel cerca de la playa. Todos los días nos levantábamos tarde y desayunábamos en la terraza del hotel. Por las mañanas íbamos a la playa y nadábamos en el mar. El agua estaba muy caliente. Por las tardes visitábamos la ciudad y comprábamos recuerdos. Una noche fuimos a un restaurante de mariscos y probé la paella por primera vez. ¡Estaba deliciosa! Fue unas vacaciones perfectas.`,
    questions: [
      { question: { sv: "Hur reste de till Málaga?", en: "How did they travel to Málaga?" }, options: ["En avión", "En coche", "En tren", "En autobús"], correctIndex: 2 },
      { question: { sv: "Vad provade berättaren för första gången?", en: "What did the narrator try for the first time?" }, options: ["Gazpacho", "Paella", "Tortilla", "Sangría"], correctIndex: 1 },
      { question: { sv: "Hur var vattnet?", en: "How was the water?" }, options: ["Frío", "Muy caliente", "Templado", "Sucio"], correctIndex: 1 },
    ],
  },
  {
    id: "nueva-ciudad",
    title: { sv: "Ny i staden", en: "New in the city" },
    level: "A2",
    topic: "life changes",
    grammarFocus: "preterite, reflexive verbs",
    difficulty: 2,
    text: `Me mudé a Sevilla hace tres meses para trabajar. Al principio fue difícil porque no conocía a nadie. Mi apartamento es pequeño pero bonito, está en el centro de la ciudad. Poco a poco empecé a conocer a mis vecinos. Mi vecina Laura es muy amable y me invitó a tomar café. También me apunté a un curso de flamenco para conocer gente nueva. Ahora tengo varios amigos y me encanta vivir aquí. Sevilla es una ciudad muy bonita con mucha historia y buena comida.`,
    questions: [
      { question: { sv: "Varför flyttade berättaren till Sevilla?", en: "Why did the narrator move to Sevilla?" }, options: ["Para estudiar", "Para trabajar", "Para la familia", "Para el clima"], correctIndex: 1 },
      { question: { sv: "Vad anmälde sig berättaren till?", en: "What did the narrator sign up for?" }, options: ["Curso de español", "Curso de cocina", "Curso de flamenco", "Curso de pintura"], correctIndex: 2 },
    ],
  },
  {
    id: "fin-de-semana",
    title: { sv: "En helg i Toledo", en: "A weekend in Toledo" },
    level: "A2",
    topic: "travel",
    grammarFocus: "preterite, comparisons",
    difficulty: 1,
    text: `El fin de semana pasado fui a Toledo con mi novio. Toledo está a una hora de Madrid en coche. Es una ciudad muy antigua y bonita. Visitamos la catedral, que es enorme y muy impresionante. Después caminamos por las calles estrechas del centro histórico. Había muchas tiendas de artesanía. Compramos unas espadas de Toledo como recuerdo. Para comer, fuimos a un restaurante típico y pedimos carcamusas, un plato tradicional de Toledo. Por la tarde, subimos a un mirador y vimos toda la ciudad desde arriba. Fue un día perfecto.`,
    questions: [
      { question: { sv: "Hur långt är det till Toledo från Madrid?", en: "How far is Toledo from Madrid?" }, options: ["30 minutos", "Una hora", "Dos horas", "Tres horas"], correctIndex: 1 },
      { question: { sv: "Vad köpte de som souvenir?", en: "What did they buy as a souvenir?" }, options: ["Cerámica", "Espadas", "Cuadros", "Joyas"], correctIndex: 1 },
      { question: { sv: "Vad är carcamusas?", en: "What are carcamusas?" }, options: ["Un postre", "Una bebida", "Un plato tradicional", "Un monumento"], correctIndex: 2 },
    ],
  },
  {
    id: "receta-tortilla",
    title: { sv: "Tortilla-recept", en: "Tortilla recipe" },
    level: "A2",
    topic: "food",
    grammarFocus: "imperative, sequence words",
    difficulty: 2,
    text: `La tortilla española es uno de los platos más populares de España. Para hacerla, necesitas: cuatro huevos, tres patatas grandes, una cebolla, aceite de oliva y sal. Primero, pela las patatas y córtalas en rodajas finas. Después, pela y corta la cebolla. Fríe las patatas y la cebolla en aceite a fuego lento durante veinte minutos. Mientras tanto, bate los huevos en un bol grande. Cuando las patatas estén blandas, mézclalas con los huevos. Pon la mezcla en la sartén y cocina a fuego bajo. Después de cinco minutos, dale la vuelta con un plato. Cocina dos minutos más. ¡Ya está lista!`,
    questions: [
      { question: { sv: "Hur många ägg behöver man?", en: "How many eggs do you need?" }, options: ["Dos", "Tres", "Cuatro", "Cinco"], correctIndex: 2 },
      { question: { sv: "Hur länge steker man potatisen?", en: "How long do you fry the potatoes?" }, options: ["Diez minutos", "Quince minutos", "Veinte minutos", "Treinta minutos"], correctIndex: 2 },
      { question: { sv: "Vad använder man för att vända tortillan?", en: "What do you use to flip the tortilla?" }, options: ["Una tapa", "Un plato", "Un tenedor", "Una espátula"], correctIndex: 1 },
    ],
  },
  {
    id: "entrevista-trabajo",
    title: { sv: "Jobbintervjun", en: "The job interview" },
    level: "A2",
    topic: "work",
    grammarFocus: "past tenses, formal language",
    difficulty: 3,
    text: `Ayer tuve una entrevista de trabajo muy importante. Me levanté temprano, me duché y me puse mi mejor traje. Estaba muy nervioso. La entrevista era en una oficina grande en el centro. Llegué quince minutos antes. La entrevistadora se llamaba María y era muy simpática. Me preguntó sobre mi experiencia, mis estudios y mis objetivos. Hablamos durante cuarenta y cinco minutos. Al final me dijo que me llamarían la próxima semana. Cuando salí, me sentí aliviado. Creo que fue bien, pero no estoy seguro. Ahora tengo que esperar.`,
    questions: [
      { question: { sv: "Hur kände sig berättaren?", en: "How did the narrator feel?" }, options: ["Tranquilo", "Nervioso", "Enfadado", "Aburrido"], correctIndex: 1 },
      { question: { sv: "Hur länge varade intervjun?", en: "How long did the interview last?" }, options: ["Treinta minutos", "Cuarenta y cinco minutos", "Una hora", "Dos horas"], correctIndex: 1 },
      { question: { sv: "Vad sa intervjuaren i slutet?", en: "What did the interviewer say at the end?" }, options: ["Que tenía el trabajo", "Que le llamarían", "Que no era suficiente", "Que necesitaba más experiencia"], correctIndex: 1 },
    ],
  },

  // ===== B1 =====
  {
    id: "medio-ambiente",
    title: { sv: "Miljön", en: "The environment" },
    level: "B1",
    topic: "environment",
    grammarFocus: "subjunctive, conditionals",
    difficulty: 1,
    text: `El cambio climático es uno de los problemas más graves de nuestro tiempo. Cada año las temperaturas suben, los glaciares se derriten y el nivel del mar aumenta. Muchos científicos dicen que si no actuamos pronto, las consecuencias serán devastadoras. Hay muchas cosas que podemos hacer en nuestra vida diaria para ayudar. Podemos reducir el uso de plástico, reciclar, usar transporte público y ahorrar energía en casa. También es importante que los gobiernos tomen medidas más fuertes. Algunos países ya están invirtiendo en energías renovables como la solar y la eólica. España, por ejemplo, es uno de los países europeos con más horas de sol y tiene un gran potencial para la energía solar.`,
    questions: [
      { question: { sv: "Vad händer med glaciärerna?", en: "What is happening to the glaciers?" }, options: ["Crecen", "Se derriten", "Se congelan más", "No cambian"], correctIndex: 1 },
      { question: { sv: "Vilken förnybar energi nämns som lämplig för Spanien?", en: "Which renewable energy is mentioned as suitable for Spain?" }, options: ["Eólica", "Nuclear", "Solar", "Hidroeléctrica"], correctIndex: 2 },
      { question: { sv: "Vad kan individer göra enligt texten?", en: "What can individuals do according to the text?" }, options: ["Solo esperar", "Reducir plástico y reciclar", "No hacer nada", "Comprar más cosas"], correctIndex: 1 },
    ],
  },
  {
    id: "tecnologia-vida",
    title: { sv: "Teknologi i vardagen", en: "Technology in daily life" },
    level: "B1",
    topic: "technology",
    grammarFocus: "present perfect, adverbs",
    difficulty: 2,
    text: `La tecnología ha cambiado completamente nuestra forma de vivir. Hace veinte años, la mayoría de la gente no tenía teléfono móvil ni acceso a internet. Hoy en día, usamos el móvil para casi todo: comunicarnos, trabajar, comprar, aprender idiomas y hasta cocinar siguiendo recetas en línea. Las redes sociales nos permiten estar en contacto con amigos y familiares en todo el mundo. Sin embargo, muchos expertos advierten que pasar demasiado tiempo frente a las pantallas puede afectar nuestra salud mental. Es importante encontrar un equilibrio y dedicar tiempo a actividades al aire libre y a las relaciones personales cara a cara.`,
    questions: [
      { question: { sv: "Vad hade de flesta inte för tjugo år sedan?", en: "What didn't most people have twenty years ago?" }, options: ["Televisión", "Teléfono móvil e internet", "Radio", "Periódicos"], correctIndex: 1 },
      { question: { sv: "Vad varnar experterna för?", en: "What do experts warn about?" }, options: ["Usar poco el móvil", "Demasiado tiempo frente a pantallas", "No usar redes sociales", "Cocinar en línea"], correctIndex: 1 },
    ],
  },
  {
    id: "sistema-educativo",
    title: { sv: "Utbildningssystemet", en: "The education system" },
    level: "B1",
    topic: "education",
    grammarFocus: "passive voice, comparisons",
    difficulty: 2,
    text: `El sistema educativo en España tiene varias etapas. La educación infantil es para niños de tres a seis años y no es obligatoria. La educación primaria dura seis años, desde los seis hasta los doce. Después viene la Educación Secundaria Obligatoria (ESO), que dura cuatro años. Al terminar la ESO, los estudiantes pueden elegir entre el Bachillerato, que prepara para la universidad, o la Formación Profesional, que ofrece habilidades prácticas para el trabajo. Muchos jóvenes españoles opinan que el sistema necesita modernizarse. Creen que debería haber más enfoque en habilidades digitales, creatividad y pensamiento crítico.`,
    questions: [
      { question: { sv: "Hur länge varar grundskolan?", en: "How long does primary education last?" }, options: ["Cuatro años", "Cinco años", "Seis años", "Siete años"], correctIndex: 2 },
      { question: { sv: "Vad förbereder Bachillerato för?", en: "What does Bachillerato prepare for?" }, options: ["El trabajo", "La universidad", "La formación profesional", "El servicio militar"], correctIndex: 1 },
      { question: { sv: "Vad tycker unga spanjorer?", en: "What do young Spaniards think?" }, options: ["Que el sistema es perfecto", "Que necesita modernizarse", "Que debe ser más largo", "Que no necesita cambios"], correctIndex: 1 },
    ],
  },
  {
    id: "salud-bienestar",
    title: { sv: "Hälsa och välmående", en: "Health and wellbeing" },
    level: "B1",
    topic: "health",
    grammarFocus: "subjunctive with recommendations",
    difficulty: 3,
    text: `Mantener una buena salud no es solo cuestión de no estar enfermo. La Organización Mundial de la Salud define la salud como un estado de completo bienestar físico, mental y social. Para cuidar nuestra salud física, los expertos recomiendan que hagamos al menos treinta minutos de ejercicio al día, que comamos cinco porciones de frutas y verduras, y que durmamos entre siete y ocho horas. La salud mental es igualmente importante. El estrés, la ansiedad y la depresión son problemas cada vez más comunes en la sociedad moderna. Los psicólogos sugieren que mantengamos relaciones sociales fuertes, que practiquemos técnicas de relajación y que busquemos ayuda profesional cuando la necesitemos.`,
    questions: [
      { question: { sv: "Hur definierar WHO hälsa?", en: "How does WHO define health?" }, options: ["No estar enfermo", "Bienestar físico, mental y social", "Hacer ejercicio", "Comer bien"], correctIndex: 1 },
      { question: { sv: "Hur mycket motion rekommenderas dagligen?", en: "How much exercise is recommended daily?" }, options: ["Quince minutos", "Treinta minutos", "Una hora", "Dos horas"], correctIndex: 1 },
      { question: { sv: "Vad föreslår psykologer?", en: "What do psychologists suggest?" }, options: ["Trabajar más", "Relaciones sociales fuertes", "Evitar a la gente", "Usar más tecnología"], correctIndex: 1 },
    ],
  },

  // ===== B2 =====
  {
    id: "historia-espana",
    title: { sv: "Spaniens moderna historia", en: "Spain's modern history" },
    level: "B2",
    topic: "history",
    grammarFocus: "past tenses, passive constructions",
    difficulty: 1,
    text: `La historia moderna de España está marcada por profundos cambios políticos y sociales. Tras casi cuatro décadas de dictadura bajo Francisco Franco (1939-1975), el país inició una transición hacia la democracia que se considera ejemplar en el mundo. El rey Juan Carlos I desempeñó un papel fundamental en este proceso, y la Constitución de 1978 estableció España como una monarquía parlamentaria. Desde entonces, el país ha experimentado una notable transformación económica y social. La entrada en la Unión Europea en 1986 aceleró la modernización del país. Sin embargo, la crisis económica de 2008 golpeó duramente a España, con tasas de desempleo que superaron el 25%. A pesar de estas dificultades, España ha demostrado una notable capacidad de recuperación y sigue siendo una de las principales economías europeas.`,
    questions: [
      { question: { sv: "När antogs den spanska konstitutionen?", en: "When was the Spanish constitution adopted?" }, options: ["1975", "1978", "1986", "2008"], correctIndex: 1 },
      { question: { sv: "När gick Spanien med i EU?", en: "When did Spain join the EU?" }, options: ["1978", "1982", "1986", "1992"], correctIndex: 2 },
      { question: { sv: "Hur hög var arbetslösheten under krisen 2008?", en: "How high was unemployment during the 2008 crisis?" }, options: ["10%", "15%", "20%", "Más del 25%"], correctIndex: 3 },
    ],
  },
  {
    id: "gastronomia-espanola",
    title: { sv: "Spansk gastronomi", en: "Spanish gastronomy" },
    level: "B2",
    topic: "culture",
    grammarFocus: "subjunctive, relative clauses",
    difficulty: 2,
    text: `La gastronomía española es mucho más que paella y sangría. Cada región tiene su propia tradición culinaria, influenciada por el clima, la geografía y la historia. En el norte, la cocina vasca es reconocida internacionalmente por su creatividad e innovación. Chefs como Juan Mari Arzak y Martín Berasategui han llevado la cocina vasca a los niveles más altos de la gastronomía mundial. En Andalucía, el gazpacho y el salmorejo son platos emblemáticos que reflejan la importancia del aceite de oliva y los tomates en la dieta mediterránea. La dieta mediterránea, declarada Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO en 2010, no es solo una forma de comer sino un estilo de vida que incluye la socialización alrededor de la mesa y el uso de productos locales y de temporada.`,
    questions: [
      { question: { sv: "Vilken regional matkultur nämns som internationellt erkänd?", en: "Which regional cuisine is mentioned as internationally recognized?" }, options: ["Catalana", "Vasca", "Andaluza", "Gallega"], correctIndex: 1 },
      { question: { sv: "När blev medelhavskosten UNESCO-kulturarv?", en: "When did the Mediterranean diet become UNESCO heritage?" }, options: ["2005", "2008", "2010", "2015"], correctIndex: 2 },
      { question: { sv: "Vad är gazpacho och salmorejo exempel på?", en: "What are gazpacho and salmorejo examples of?" }, options: ["Cocina vasca", "Platos emblemáticos andaluces", "Postres tradicionales", "Cocina moderna"], correctIndex: 1 },
    ],
  },
  {
    id: "migracion-identidad",
    title: { sv: "Migration och identitet", en: "Migration and identity" },
    level: "B2",
    topic: "society",
    grammarFocus: "subjunctive, complex clauses",
    difficulty: 3,
    text: `España ha pasado de ser un país de emigración a convertirse en un destino de inmigración en pocas décadas. Durante los años sesenta y setenta, millones de españoles emigraron a países como Alemania, Francia y Suiza en busca de mejores oportunidades laborales. Sin embargo, desde los años noventa, España ha recibido un flujo constante de inmigrantes procedentes de Latinoamérica, el norte de África y Europa del Este. Esta transformación ha enriquecido la sociedad española con nuevas perspectivas culturales, pero también ha generado debates sobre la integración, la identidad nacional y las políticas migratorias. Los sociólogos señalan que las sociedades multiculturales necesitan políticas activas de inclusión que promuevan el diálogo intercultural y combatan la discriminación.`,
    questions: [
      { question: { sv: "Vart emigrerade spanjorer på 60- och 70-talet?", en: "Where did Spaniards emigrate to in the 60s and 70s?" }, options: ["Latinoamérica", "Alemania, Francia y Suiza", "Estados Unidos", "Asia"], correctIndex: 1 },
      { question: { sv: "Varifrån kommer de största invandrargrupperna sedan 90-talet?", en: "Where do the largest immigrant groups come from since the 90s?" }, options: ["Solo Europa", "Solo África", "Latinoamérica, norte de África y Europa del Este", "Asia y Oceanía"], correctIndex: 2 },
      { question: { sv: "Vad behöver mångkulturella samhällen enligt sociologer?", en: "What do multicultural societies need according to sociologists?" }, options: ["Fronteras cerradas", "Políticas de inclusión", "Menos inmigración", "Más control policial"], correctIndex: 1 },
    ],
  },

  // ===== C1 =====
  {
    id: "arte-espanol",
    title: { sv: "Spansk konst genom tiderna", en: "Spanish art through the ages" },
    level: "C1",
    topic: "art",
    grammarFocus: "complex syntax, literary register",
    difficulty: 1,
    text: `España ha sido cuna de algunos de los artistas más influyentes de la historia del arte occidental. Desde las misteriosas pinturas rupestres de Altamira, pasando por la intensidad dramática de El Greco, hasta la genialidad subversiva de Goya, el arte español siempre ha reflejado una profunda conexión con la condición humana. En el siglo XX, figuras como Pablo Picasso, Salvador Dalí y Joan Miró revolucionaron el panorama artístico internacional. Picasso, con su Guernica, creó posiblemente la obra antibelicista más poderosa jamás pintada, mientras que Dalí exploró los territorios del subconsciente con una precisión técnica asombrosa. La tradición artística española contemporánea sigue viva con artistas como Antoni Tàpies, quien desafió las convenciones del arte matérico, y más recientemente, Jaume Plensa, cuyas esculturas monumentales dialogan con el espacio público de ciudades de todo el mundo.`,
    questions: [
      { question: { sv: "Vilken konstnär skapade Guernica?", en: "Which artist created Guernica?" }, options: ["Dalí", "Miró", "Picasso", "Goya"], correctIndex: 2 },
      { question: { sv: "Vad utforskade Dalí i sin konst?", en: "What did Dalí explore in his art?" }, options: ["La naturaleza", "El subconsciente", "La política", "La religión"], correctIndex: 1 },
      { question: { sv: "Vem nämns som samtida skulptör?", en: "Who is mentioned as a contemporary sculptor?" }, options: ["Tàpies", "Plensa", "Miró", "El Greco"], correctIndex: 1 },
    ],
  },
  {
    id: "economia-digital",
    title: { sv: "Den digitala ekonomin", en: "The digital economy" },
    level: "C1",
    topic: "economy",
    grammarFocus: "conditional perfect, formal register",
    difficulty: 2,
    text: `La transformación digital ha alterado fundamentalmente las estructuras económicas tradicionales. Plataformas como la economía colaborativa, el comercio electrónico y el trabajo remoto han redefinido conceptos que parecían inmutables: la propiedad, el empleo estable y la separación entre vida laboral y personal. En España, el teletrabajo experimentó un crecimiento exponencial durante la pandemia, pasando del 4,8% al 16,2% de los trabajadores en cuestión de semanas. Sin embargo, la legislación laboral no ha conseguido adaptarse al mismo ritmo. Los sindicatos advierten de que la digitalización podría profundizar las desigualdades si no se implementan políticas de formación continua y protección social. Por otro lado, los defensores de la innovación argumentan que la automatización y la inteligencia artificial crearán nuevas categorías de empleo que aún no podemos imaginar.`,
    questions: [
      { question: { sv: "Hur stor var ökningen av distansarbete under pandemin?", en: "How much did remote work increase during the pandemic?" }, options: ["De 2% a 8%", "De 4,8% a 16,2%", "De 10% a 25%", "De 15% a 30%"], correctIndex: 1 },
      { question: { sv: "Vad oroar sig fackföreningarna för?", en: "What are unions worried about?" }, options: ["Más empleo", "Profundizar desigualdades", "Más vacaciones", "Menos tecnología"], correctIndex: 1 },
      { question: { sv: "Vad har digitaliseringen gjort med begreppet anställning?", en: "What has digitalization done to the concept of employment?" }, options: ["Lo ha fortalecido", "Lo ha redefinido", "Lo ha eliminado", "No ha tenido efecto"], correctIndex: 1 },
    ],
  },
  {
    id: "literatura-cervantes",
    title: { sv: "Cervantes och den moderna romanen", en: "Cervantes and the modern novel" },
    level: "C1",
    topic: "literature",
    grammarFocus: "literary analysis, subjunctive",
    difficulty: 3,
    text: `Miguel de Cervantes Saavedra publicó la primera parte de "Don Quijote de la Mancha" en 1605, inaugurando lo que muchos críticos consideran la primera novela moderna de la literatura universal. La genialidad de la obra radica no solo en su humor y su crítica social, sino en su complejidad narrativa: un narrador que cuestiona su propia fiabilidad, personajes que evolucionan psicológicamente y una constante reflexión sobre la naturaleza de la ficción. Don Quijote, el hidalgo que enloquece leyendo novelas de caballerías y decide convertirse en caballero andante, representa la tensión eterna entre idealismo y realismo. Sancho Panza, su escudero, funciona como contrapunto terrenal. A lo largo de la obra, ambos se influyen mutuamente, difuminando las fronteras entre locura y cordura, entre ficción y realidad.`,
    questions: [
      { question: { sv: "När publicerades Don Quijote?", en: "When was Don Quixote published?" }, options: ["1492", "1580", "1605", "1650"], correctIndex: 2 },
      { question: { sv: "Vad representerar Don Quijote enligt texten?", en: "What does Don Quixote represent according to the text?" }, options: ["La realidad", "La tensión entre idealismo y realismo", "El poder", "La religión"], correctIndex: 1 },
      { question: { sv: "Vilken roll spelar Sancho Panza?", en: "What role does Sancho Panza play?" }, options: ["Narrador", "Antagonista", "Contrapunto terrenal", "Caballero"], correctIndex: 2 },
    ],
  },

  // ===== C2 =====
  {
    id: "filosofia-ortega",
    title: { sv: "Ortega y Gasset och massamhället", en: "Ortega y Gasset and mass society" },
    level: "C2",
    topic: "philosophy",
    grammarFocus: "abstract reasoning, advanced syntax",
    difficulty: 1,
    text: `José Ortega y Gasset, en su obra "La rebelión de las masas" (1930), anticipó con notable lucidez muchos de los dilemas que definen las sociedades contemporáneas. Su concepto del "hombre-masa" —aquel individuo que, beneficiándose de los logros de la civilización, se desentiende de los esfuerzos y sacrificios que los hicieron posibles— resuena con particular intensidad en la era de las redes sociales y la posverdad. Ortega argumentaba que la democracia no consiste simplemente en el gobierno de la mayoría, sino en la convivencia de mayorías y minorías bajo un marco de respeto mutuo y diálogo racional. La degradación de este principio, sostenía, conduciría inevitablemente a formas de barbarie revestidas de modernidad. Resulta inquietante constatar cuántas de sus advertencias mantienen su vigencia casi un siglo después.`,
    questions: [
      { question: { sv: "Vad är 'hombre-masa' enligt Ortega?", en: "What is 'mass man' according to Ortega?" }, options: ["Un líder político", "Quien disfruta logros sin valorar los esfuerzos", "Un trabajador industrial", "Un intelectual"], correctIndex: 1 },
      { question: { sv: "Vad ansåg Ortega att demokrati innebär?", en: "What did Ortega consider democracy to be?" }, options: ["Solo gobierno de la mayoría", "Convivencia con respeto y diálogo", "Poder absoluto", "Anarquía ordenada"], correctIndex: 1 },
      { question: { sv: "När publicerades La rebelión de las masas?", en: "When was The Revolt of the Masses published?" }, options: ["1920", "1925", "1930", "1936"], correctIndex: 2 },
    ],
  },
  {
    id: "lenguas-espana",
    title: { sv: "Språklig mångfald i Spanien", en: "Linguistic diversity in Spain" },
    level: "C2",
    topic: "linguistics",
    grammarFocus: "nuanced argumentation, conditional",
    difficulty: 2,
    text: `La realidad lingüística de España constituye un fenómeno de extraordinaria complejidad que trasciende lo meramente comunicativo para adentrarse en los ámbitos de la identidad, la política y la cohesión territorial. Junto al castellano —lengua oficial del Estado—, coexisten el catalán, el gallego, el euskera y el aranés, todas ellas cooficiales en sus respectivos territorios. El euskera resulta particularmente fascinante desde una perspectiva filológica: se trata de una lengua preindoeuropea cuyo origen sigue siendo objeto de debate académico, sin parentesco demostrado con ninguna otra lengua viva. Las tensiones entre las políticas de inmersión lingüística impulsadas por ciertos gobiernos autonómicos y la defensa del derecho a la educación en castellano ejemplifican cómo la lengua puede convertirse en un instrumento tanto de cohesión como de fractura social.`,
    questions: [
      { question: { sv: "Vad är speciellt med euskera?", en: "What is special about Basque?" }, options: ["Es romance", "Es preindoeuropea sin parentesco conocido", "Viene del latín", "Es artificial"], correctIndex: 1 },
      { question: { sv: "Vilka språk är samofficiella i Spanien?", en: "Which languages are co-official in Spain?" }, options: ["Solo catalán", "Catalán, gallego, euskera y aranés", "Catalán y gallego", "Solo euskera"], correctIndex: 1 },
      { question: { sv: "Vilken spänning nämns?", en: "What tension is mentioned?" }, options: ["Entre español y francés", "Entre inmersión lingüística y educación en castellano", "Entre lenguas antiguas y modernas", "Entre oral y escrito"], correctIndex: 1 },
    ],
  },
];
