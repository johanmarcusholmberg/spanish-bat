import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export type ReviewState = "new" | "learning" | "familiar" | "mastered";

export interface VocabularyWord {
  id: string;
  spanish: string;
  translation: string;
  context?: string;
  category: string;
  item_type: string;
  learned: boolean;
  created_at: string;
  usage_example?: string;
  level?: string;
  topic_tags?: string[];
  review_state: ReviewState;
  next_review: string;
  ease_factor: number;
  interval_days: number;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
}

export const useVocabulary = () => {
  const { toast } = useToast();
  const { user: clerkUser, isLoaded } = useUser();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    if (!clerkUser) return;
    setLoading(true);
    try {
      const result = await api.vocabulary.get();
      const mapped = (result.words || []).map((w: Record<string, unknown>) => ({
        id: w.id as string,
        spanish: w.spanish as string,
        translation: w.translation as string,
        context: w.context as string | undefined,
        category: w.category as string,
        item_type: w.itemType as string,
        learned: w.learned as boolean,
        created_at: w.createdAt as string,
        usage_example: w.usageExample as string | undefined,
        level: w.level as string | undefined,
        topic_tags: w.topicTags as string[] | undefined,
        review_state: ((w.reviewState as ReviewState) ?? "new"),
        next_review: ((w.nextReview as string) ?? new Date().toISOString()),
        ease_factor: typeof w.easeFactor === "number" ? w.easeFactor : Number(w.easeFactor) || 2.5,
        interval_days: typeof w.intervalDays === "number" ? w.intervalDays : Number(w.intervalDays) || 0,
        review_count: typeof w.reviewCount === "number" ? w.reviewCount : Number(w.reviewCount) || 0,
        correct_count: typeof w.correctCount === "number" ? w.correctCount : Number(w.correctCount) || 0,
        incorrect_count: typeof w.incorrectCount === "number" ? w.incorrectCount : Number(w.incorrectCount) || 0,
      }));
      setWords(mapped.sort((a: VocabularyWord, b: VocabularyWord) => (b.created_at > a.created_at ? 1 : -1)));
    } catch {
      // fail silently
    }
    setLoading(false);
  }, [clerkUser?.id]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchWords();
    } else if (isLoaded && !clerkUser) {
      setLoading(false);
    }
  }, [isLoaded, clerkUser?.id, fetchWords]);

  const addWord = useCallback(async (
    spanish: string,
    translation: string,
    context?: string,
    category: string = "conversation",
    learned: boolean = false,
    item_type: string = "word",
    usage_example?: string,
    level?: string,
    topic_tags?: string[],
  ) => {
    if (!clerkUser) return false;

    try {
      await api.vocabulary.add({
        spanish: spanish.toLowerCase().trim(),
        translation: translation.trim(),
        context,
        category,
        learned,
        itemType: item_type,
        usageExample: usage_example,
        level,
        topicTags: topic_tags,
      });
      await fetchWords();
      toast({ title: "Sparat", description: `"${spanish}" har lagts till i din ordbok` });
      return true;
    } catch {
      toast({ title: "Fel", description: "Kunde inte spara ordet", variant: "destructive" });
      return false;
    }
  }, [clerkUser?.id, fetchWords, toast]);

  const removeWord = useCallback(async (id: string) => {
    try {
      await api.vocabulary.remove(id);
      setWords(prev => prev.filter(w => w.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateWord = useCallback(async (id: string, updates: Partial<Pick<VocabularyWord, "spanish" | "translation" | "learned" | "item_type" | "category" | "usage_example">>) => {
    try {
      const apiUpdates: Record<string, unknown> = {};
      if (updates.spanish !== undefined) apiUpdates.spanish = updates.spanish;
      if (updates.translation !== undefined) apiUpdates.translation = updates.translation;
      if (updates.learned !== undefined) apiUpdates.learned = updates.learned;
      if (updates.item_type !== undefined) apiUpdates.itemType = updates.item_type;
      if (updates.category !== undefined) apiUpdates.category = updates.category;
      if (updates.usage_example !== undefined) apiUpdates.usageExample = updates.usage_example;
      await api.vocabulary.update(id, apiUpdates);
      setWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleLearned = useCallback(async (id: string) => {
    const word = words.find(w => w.id === id);
    if (!word) return false;
    return updateWord(id, { learned: !word.learned });
  }, [words, updateWord]);

  return {
    words,
    loading,
    addWord,
    removeWord,
    updateWord,
    toggleLearned,
    refetch: fetchWords,
  };
};
