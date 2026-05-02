export type EncouragementLang = "sv" | "en";

interface Bucket {
  emoji: string;
  sv: string;
  en: string;
}

const BUCKETS: Bucket[] = [
  { emoji: "🏆", sv: "Otroligt jobbat — du har det här!", en: "Outstanding — you've nailed it!" },
  { emoji: "🎉", sv: "Snyggt! Du är på god väg.", en: "Great work! You're on the right track." },
  { emoji: "👍", sv: "Bra ansträngning — fortsätt så.", en: "Solid effort — keep going." },
  { emoji: "💪", sv: "Inte illa! Lite mer träning så sitter det.", en: "Not bad! A bit more practice and it'll click." },
  { emoji: "🌱", sv: "Försök igen — varje misstag är en lärdom.", en: "Try again — every mistake teaches you something." },
];

export function encouragementFor(score: number, lang: EncouragementLang = "sv"): {
  emoji: string;
  text: string;
} {
  let bucket: Bucket;
  if (score >= 90) bucket = BUCKETS[0];
  else if (score >= 75) bucket = BUCKETS[1];
  else if (score >= 60) bucket = BUCKETS[2];
  else if (score >= 40) bucket = BUCKETS[3];
  else bucket = BUCKETS[4];
  return { emoji: bucket.emoji, text: lang === "sv" ? bucket.sv : bucket.en };
}
