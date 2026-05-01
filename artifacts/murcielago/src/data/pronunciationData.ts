import type { Level } from "@/contexts/AuthContext";

export interface PronunciationItem {
  id: string;
  type: "word" | "phrase" | "sentence";
  spanish: string;
  english: string;
  swedish: string;
  hint?: string;
}

const A1: PronunciationItem[] = [
  // Words
  { id: "a1-w1", type: "word", spanish: "Hola", english: "Hello", swedish: "Hej" },
  { id: "a1-w2", type: "word", spanish: "Gracias", english: "Thank you", swedish: "Tack" },
  { id: "a1-w3", type: "word", spanish: "Por favor", english: "Please", swedish: "Snälla" },
  { id: "a1-w4", type: "word", spanish: "Buenos", english: "Good", swedish: "Bra" },
  { id: "a1-w5", type: "word", spanish: "Casa", english: "House", swedish: "Hus" },
  { id: "a1-w6", type: "word", spanish: "Agua", english: "Water", swedish: "Vatten" },
  { id: "a1-w7", type: "word", spanish: "Amigo", english: "Friend", swedish: "Vän" },
  { id: "a1-w8", type: "word", spanish: "Comida", english: "Food", swedish: "Mat" },
  { id: "a1-w9", type: "word", spanish: "Perro", english: "Dog", swedish: "Hund", hint: "Roll the double 'rr'" },
  { id: "a1-w10", type: "word", spanish: "Gato", english: "Cat", swedish: "Katt" },
  // Phrases
  { id: "a1-p1", type: "phrase", spanish: "Buenos días", english: "Good morning", swedish: "God morgon" },
  { id: "a1-p2", type: "phrase", spanish: "Buenas noches", english: "Good night", swedish: "God natt" },
  { id: "a1-p3", type: "phrase", spanish: "Muchas gracias", english: "Thank you very much", swedish: "Tack så mycket" },
  { id: "a1-p4", type: "phrase", spanish: "Con permiso", english: "Excuse me", swedish: "Ursäkta mig" },
  { id: "a1-p5", type: "phrase", spanish: "Mucho gusto", english: "Nice to meet you", swedish: "Trevligt att träffas" },
  // Sentences
  { id: "a1-s1", type: "sentence", spanish: "Me llamo María.", english: "My name is María.", swedish: "Jag heter María." },
  { id: "a1-s2", type: "sentence", spanish: "¿Cómo estás?", english: "How are you?", swedish: "Hur mår du?" },
  { id: "a1-s3", type: "sentence", spanish: "Yo quiero agua.", english: "I want water.", swedish: "Jag vill ha vatten." },
  { id: "a1-s4", type: "sentence", spanish: "¿Dónde está el baño?", english: "Where is the bathroom?", swedish: "Var är toaletten?" },
  { id: "a1-s5", type: "sentence", spanish: "Tengo hambre.", english: "I am hungry.", swedish: "Jag är hungrig." },
];

const A2: PronunciationItem[] = [
  { id: "a2-w1", type: "word", spanish: "Desarrollo", english: "Development", swedish: "Utveckling", hint: "Stress on the third syllable: de-sa-RRO-llo" },
  { id: "a2-w2", type: "word", spanish: "Izquierda", english: "Left", swedish: "Vänster" },
  { id: "a2-w3", type: "word", spanish: "Derecha", english: "Right", swedish: "Höger" },
  { id: "a2-w4", type: "word", spanish: "Siguiente", english: "Next", swedish: "Nästa" },
  { id: "a2-w5", type: "word", spanish: "Entonces", english: "Then", swedish: "Sedan" },
  { id: "a2-w6", type: "word", spanish: "Todavía", english: "Still", swedish: "Fortfarande" },
  { id: "a2-w7", type: "word", spanish: "Cuchara", english: "Spoon", swedish: "Sked" },
  { id: "a2-w8", type: "word", spanish: "Cerveza", english: "Beer", swedish: "Öl" },
  { id: "a2-p1", type: "phrase", spanish: "¿Cuánto cuesta?", english: "How much does it cost?", swedish: "Hur mycket kostar det?" },
  { id: "a2-p2", type: "phrase", spanish: "Me gustaría pedir", english: "I would like to order", swedish: "Jag skulle vilja beställa" },
  { id: "a2-p3", type: "phrase", spanish: "¿Puede repetir?", english: "Can you repeat?", swedish: "Kan du upprepa?" },
  { id: "a2-p4", type: "phrase", spanish: "No entiendo", english: "I don't understand", swedish: "Jag förstår inte" },
  { id: "a2-s1", type: "sentence", spanish: "Necesito ir al supermercado.", english: "I need to go to the supermarket.", swedish: "Jag behöver gå till snabbköpet." },
  { id: "a2-s2", type: "sentence", spanish: "¿Puedes ayudarme con esto?", english: "Can you help me with this?", swedish: "Kan du hjälpa mig med det här?" },
  { id: "a2-s3", type: "sentence", spanish: "Me gusta mucho la comida española.", english: "I really like Spanish food.", swedish: "Jag gillar spansk mat väldigt mycket." },
  { id: "a2-s4", type: "sentence", spanish: "Ayer fui al cine con mis amigos.", english: "Yesterday I went to the cinema with my friends.", swedish: "Igår gick jag på bio med mina vänner." },
];

const B1: PronunciationItem[] = [
  { id: "b1-w1", type: "word", spanish: "Desenvolvimiento", english: "Unfolding", swedish: "Utvecklande" },
  { id: "b1-w2", type: "word", spanish: "Responsabilidad", english: "Responsibility", swedish: "Ansvar" },
  { id: "b1-w3", type: "word", spanish: "Oportunidad", english: "Opportunity", swedish: "Möjlighet" },
  { id: "b1-w4", type: "word", spanish: "Incertidumbre", english: "Uncertainty", swedish: "Osäkerhet" },
  { id: "b1-p1", type: "phrase", spanish: "Tengo que decirte algo importante", english: "I have to tell you something important", swedish: "Jag måste berätta något viktigt för dig" },
  { id: "b1-p2", type: "phrase", spanish: "¿Qué opinas sobre esto?", english: "What do you think about this?", swedish: "Vad tycker du om det här?" },
  { id: "b1-p3", type: "phrase", spanish: "En mi opinión", english: "In my opinion", swedish: "Enligt min mening" },
  { id: "b1-s1", type: "sentence", spanish: "Si tuviera más tiempo, viajaría por toda Sudamérica.", english: "If I had more time, I would travel all over South America.", swedish: "Om jag hade mer tid skulle jag resa genom hela Sydamerika." },
  { id: "b1-s2", type: "sentence", spanish: "Es importante que practiquemos todos los días.", english: "It's important that we practice every day.", swedish: "Det är viktigt att vi övar varje dag." },
  { id: "b1-s3", type: "sentence", spanish: "Cuando era pequeño, jugaba en el parque.", english: "When I was little, I used to play in the park.", swedish: "När jag var liten brukade jag leka i parken." },
  { id: "b1-s4", type: "sentence", spanish: "Me encantaría que vinieras a la fiesta.", english: "I would love for you to come to the party.", swedish: "Jag skulle älska om du kom till festen." },
];

const B2: PronunciationItem[] = [
  { id: "b2-w1", type: "word", spanish: "Imprescindible", english: "Essential", swedish: "Oumbärlig" },
  { id: "b2-w2", type: "word", spanish: "Circunstancia", english: "Circumstance", swedish: "Omständighet" },
  { id: "b2-w3", type: "word", spanish: "Espontáneo", english: "Spontaneous", swedish: "Spontan" },
  { id: "b2-p1", type: "phrase", spanish: "A pesar de las dificultades", english: "Despite the difficulties", swedish: "Trots svårigheterna" },
  { id: "b2-p2", type: "phrase", spanish: "Desde mi punto de vista", english: "From my point of view", swedish: "Ur min synvinkel" },
  { id: "b2-s1", type: "sentence", spanish: "Aunque no estoy de acuerdo con tu perspectiva, respeto tu opinión.", english: "Although I don't agree with your perspective, I respect your opinion.", swedish: "Även om jag inte håller med om ditt perspektiv respekterar jag din åsikt." },
  { id: "b2-s2", type: "sentence", spanish: "Es fundamental que los ciudadanos participen activamente en la sociedad.", english: "It is fundamental that citizens actively participate in society.", swedish: "Det är grundläggande att medborgarna deltar aktivt i samhället." },
  { id: "b2-s3", type: "sentence", spanish: "Habría preferido que me lo hubieras dicho antes.", english: "I would have preferred that you had told me before.", swedish: "Jag hade föredragit att du berättat det för mig innan." },
];

const C1: PronunciationItem[] = [
  { id: "c1-w1", type: "word", spanish: "Desafortunadamente", english: "Unfortunately", swedish: "Olyckligtvis" },
  { id: "c1-w2", type: "word", spanish: "Contemporáneo", english: "Contemporary", swedish: "Samtida" },
  { id: "c1-p1", type: "phrase", spanish: "En lo que a mí respecta", english: "As far as I'm concerned", swedish: "Vad mig beträffar" },
  { id: "c1-p2", type: "phrase", spanish: "No cabe la menor duda de que", english: "There is no doubt whatsoever that", swedish: "Det råder inte minsta tvivel om att" },
  { id: "c1-s1", type: "sentence", spanish: "La globalización ha transformado radicalmente la forma en que nos comunicamos y hacemos negocios.", english: "Globalization has radically transformed the way we communicate and do business.", swedish: "Globaliseringen har radikalt förändrat sättet vi kommunicerar och gör affärer på." },
  { id: "c1-s2", type: "sentence", spanish: "Si bien es cierto que la tecnología nos facilita la vida, también plantea nuevos desafíos éticos.", english: "While it's true that technology makes our lives easier, it also poses new ethical challenges.", swedish: "Även om det är sant att teknologin underlättar våra liv, ställer den också nya etiska utmaningar." },
];

const C2: PronunciationItem[] = [
  { id: "c2-w1", type: "word", spanish: "Sobreentendimiento", english: "Implicit understanding", swedish: "Underförståelse" },
  { id: "c2-w2", type: "word", spanish: "Inconmensurable", english: "Immeasurable", swedish: "Omätbar" },
  { id: "c2-p1", type: "phrase", spanish: "Haciendo de tripas corazón", english: "Putting on a brave face", swedish: "Att bita ihop" },
  { id: "c2-s1", type: "sentence", spanish: "La idiosincrasia de cada pueblo se manifiesta en sus tradiciones, las cuales, lejos de ser reliquias del pasado, constituyen el tejido vivo de su identidad.", english: "The idiosyncrasy of each people manifests in their traditions, which, far from being relics of the past, constitute the living fabric of their identity.", swedish: "Varje folks egenart manifesteras i deras traditioner, vilka långt ifrån att vara relikter från det förflutna, utgör den levande väven av deras identitet." },
  { id: "c2-s2", type: "sentence", spanish: "No por mucho madrugar amanece más temprano, pero la perseverancia en el estudio rinde frutos inestimables.", english: "Getting up early doesn't make the sun rise sooner, but perseverance in study yields invaluable fruits.", swedish: "Att stiga upp tidigt gör inte att solen går upp snabbare, men uthållighet i studier ger ovärderliga frukter." },
];

export const pronunciationByLevel: Record<Level, PronunciationItem[]> = {
  A1, A2, B1, B2, C1, C2,
};

export function getItemsByType(items: PronunciationItem[], type: PronunciationItem["type"]): PronunciationItem[] {
  return items.filter(i => i.type === type);
}

export function shuffleItems(items: PronunciationItem[]): PronunciationItem[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
