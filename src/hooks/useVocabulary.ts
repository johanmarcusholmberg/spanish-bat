import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyWord {
  id: string;
  spanish: string;
  translation: string;
  context?: string;
  category: string;
  item_type: string;
  learned: boolean;
  created_at: string;
}

export const useVocabulary = () => {
  const { toast } = useToast();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const fetchWords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_vocabulary")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vocabulary:", error);
    } else {
      setWords((data || []) as unknown as VocabularyWord[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const addWord = useCallback(async (
    spanish: string,
    translation: string,
    context?: string,
    category: string = "conversation",
    learned: boolean = false,
    item_type: string = "word"
  ) => {
    if (!userId) return false;

    const { error } = await supabase
      .from("user_vocabulary")
      .upsert({
        user_id: userId,
        spanish: spanish.toLowerCase().trim(),
        translation: translation.trim(),
        context,
        category,
        learned,
        item_type,
      } as any, { onConflict: "user_id,spanish" });

    if (error) {
      console.error("Error adding word:", error);
      toast({ title: "Fel", description: "Kunde inte spara ordet", variant: "destructive" });
      return false;
    }

    await fetchWords();
    toast({ title: "Sparat!", description: `"${spanish}" har lagts till i din ordbok` });
    return true;
  }, [userId, fetchWords, toast]);

  const removeWord = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("user_vocabulary")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing word:", error);
      return false;
    }
    setWords(prev => prev.filter(w => w.id !== id));
    return true;
  }, []);

  const updateWord = useCallback(async (id: string, updates: Partial<Pick<VocabularyWord, "spanish" | "translation" | "learned" | "item_type" | "category">>) => {
    const { error } = await supabase
      .from("user_vocabulary")
      .update(updates as any)
      .eq("id", id);

    if (error) {
      console.error("Error updating word:", error);
      return false;
    }
    setWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    return true;
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
