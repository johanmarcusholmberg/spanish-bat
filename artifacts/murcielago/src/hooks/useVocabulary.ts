import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

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
      const mapped = (result.words || []).map((w: any) => ({
        id: w.id,
        spanish: w.spanish,
        translation: w.translation,
        context: w.context,
        category: w.category,
        item_type: w.itemType,
        learned: w.learned,
        created_at: w.createdAt,
        usage_example: w.usageExample,
        level: w.level,
        topic_tags: w.topicTags,
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
