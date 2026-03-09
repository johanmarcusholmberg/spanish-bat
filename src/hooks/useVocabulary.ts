import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyWord {
  id: string;
  spanish: string;
  translation: string;
  context?: string;
  category: string;
  created_at: string;
}

export const useVocabulary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("user_vocabulary")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vocabulary:", error);
    } else {
      setWords(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const addWord = useCallback(async (
    spanish: string, 
    translation: string, 
    context?: string,
    category: string = "conversation"
  ) => {
    if (!user?.id) return false;

    const { error } = await supabase
      .from("user_vocabulary")
      .upsert({
        user_id: user.id,
        spanish: spanish.toLowerCase().trim(),
        translation: translation.trim(),
        context,
        category,
      }, { onConflict: "user_id,spanish" });

    if (error) {
      console.error("Error adding word:", error);
      toast({
        title: "Fel",
        description: "Kunde inte spara ordet",
        variant: "destructive",
      });
      return false;
    }

    await fetchWords();
    toast({
      title: "Sparat!",
      description: `"${spanish}" har lagts till i din ordbok`,
    });
    return true;
  }, [user?.id, fetchWords, toast]);

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

  return {
    words,
    loading,
    addWord,
    removeWord,
    refetch: fetchWords,
  };
};
