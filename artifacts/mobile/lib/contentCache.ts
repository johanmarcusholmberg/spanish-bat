/**
 * Tiny AsyncStorage cache for static learning content fetched from the API.
 * Keeps grammar lessons + reading passages available offline after the first
 * successful fetch. The bundled `@workspace/learning-content` package
 * provides a final hard fallback if the cache is also empty.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GRAMMAR_LESSONS,
  READING_PASSAGES,
  type GrammarLesson,
  type ReadingPassage,
} from "@workspace/learning-content";
import { api } from "@/lib/api";

const GRAMMAR_KEY = "murci_content_grammar_v1";
const READING_KEY = "murci_content_reading_v1";

async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort
  }
}

export async function loadGrammarLessons(): Promise<GrammarLesson[]> {
  try {
    const res = await api.content.getGrammarLessons();
    const lessons = res.lessons as GrammarLesson[];
    await writeCache(GRAMMAR_KEY, lessons);
    return lessons;
  } catch {
    const cached = await readCache<GrammarLesson[]>(GRAMMAR_KEY);
    if (cached && cached.length > 0) return cached;
    return GRAMMAR_LESSONS;
  }
}

export async function loadReadingPassages(): Promise<ReadingPassage[]> {
  try {
    const res = await api.content.getReadingPassages();
    const passages = res.passages as ReadingPassage[];
    await writeCache(READING_KEY, passages);
    return passages;
  } catch {
    const cached = await readCache<ReadingPassage[]>(READING_KEY);
    if (cached && cached.length > 0) return cached;
    return READING_PASSAGES;
  }
}
