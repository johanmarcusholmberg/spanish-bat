// Local seed content. Grammar lessons and reading passages now live in
// `@workspace/learning-content` and are served by the API
// (`/grammar-lessons`, `/reading-passages`). Only flashcard seeds remain
// here — they bootstrap the Flashcards session when the user has no saved
// vocabulary yet.
// TODO(api): replace SEED_FLASHCARDS with /flashcards endpoint that returns due cards.

export type { Level } from "@workspace/learning-content";
import type { Level } from "@workspace/learning-content";

export interface SeedFlashcard {
  id: string;
  spanish: string;
  translation: { en: string; sv: string };
  level: Level;
  example?: string;
}

export const SEED_FLASHCARDS: SeedFlashcard[] = [
  { id: "seed-1", spanish: "hola", translation: { en: "hello", sv: "hej" }, level: "A1" },
  { id: "seed-2", spanish: "gracias", translation: { en: "thank you", sv: "tack" }, level: "A1" },
  { id: "seed-3", spanish: "por favor", translation: { en: "please", sv: "tack/snälla" }, level: "A1" },
  { id: "seed-4", spanish: "amigo", translation: { en: "friend", sv: "vän" }, level: "A1" },
  { id: "seed-5", spanish: "casa", translation: { en: "house", sv: "hus" }, level: "A1" },
  { id: "seed-6", spanish: "libro", translation: { en: "book", sv: "bok" }, level: "A1" },
  { id: "seed-7", spanish: "trabajar", translation: { en: "to work", sv: "att jobba" }, level: "A2" },
  { id: "seed-8", spanish: "viajar", translation: { en: "to travel", sv: "att resa" }, level: "A2" },
];
