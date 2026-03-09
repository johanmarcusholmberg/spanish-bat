import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trash2, Volume2, Plus, Search, Shuffle } from "lucide-react";
import { useVocabulary, VocabularyWord } from "@/hooks/useVocabulary";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";

const VocabularyPage = () => {
  const { language } = useLanguage();
  const { words, loading, addWord, removeWord } = useVocabulary();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const [search, setSearch] = useState("");
  const [newSpanish, setNewSpanish] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([]);

  const filteredWords = words.filter(w => 
    w.spanish.toLowerCase().includes(search.toLowerCase()) ||
    w.translation.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newSpanish.trim() || !newTranslation.trim()) return;
    const success = await addWord(newSpanish, newTranslation);
    if (success) {
      setNewSpanish("");
      setNewTranslation("");
      setShowAdd(false);
    }
  };

  const startPractice = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentCard(0);
    setShowAnswer(false);
    setPracticeMode(true);
  };

  const nextCard = () => {
    if (currentCard < shuffledWords.length - 1) {
      setCurrentCard(c => c + 1);
      setShowAnswer(false);
    } else {
      setPracticeMode(false);
    }
  };

  if (practiceMode && shuffledWords.length > 0) {
    const card = shuffledWords[currentCard];
    return (
      <AppLayout>
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {language === "sv" ? "Öva ordförråd" : "Practice Vocabulary"}
            </h1>
            <Button variant="outline" onClick={() => setPracticeMode(false)}>
              {language === "sv" ? "Avsluta" : "Exit"}
            </Button>
          </div>

          <div className="text-center text-muted-foreground mb-4">
            {currentCard + 1} / {shuffledWords.length}
          </div>

          <Card 
            className="max-w-md mx-auto cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <CardContent className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-foreground mb-2">
                {showAnswer ? card.translation : card.spanish}
              </p>
              {!showAnswer && ttsSupported && (
                <button
                  onClick={(e) => { e.stopPropagation(); speak(card.spanish); }}
                  className="mt-2 text-muted-foreground hover:text-foreground transition"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
              {showAnswer && card.context && (
                <p className="text-sm text-muted-foreground mt-2 italic">"{card.context}"</p>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                {language === "sv" ? "Tryck för att vända" : "Tap to flip"}
              </p>
            </CardContent>
          </Card>

          {showAnswer && (
            <div className="flex justify-center mt-4">
              <Button onClick={nextCard}>
                {currentCard < shuffledWords.length - 1 
                  ? (language === "sv" ? "Nästa" : "Next")
                  : (language === "sv" ? "Klar!" : "Done!")}
              </Button>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {language === "sv" ? "Min ordbok" : "My Dictionary"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {words.length} {language === "sv" ? "sparade ord" : "saved words"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "sv" ? "Sök ord..." : "Search words..."}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4 mr-1" />
            {language === "sv" ? "Lägg till" : "Add"}
          </Button>
          {words.length >= 3 && (
            <Button onClick={startPractice}>
              <Shuffle className="h-4 w-4 mr-1" />
              {language === "sv" ? "Öva" : "Practice"}
            </Button>
          )}
        </div>

        {showAdd && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newSpanish}
                  onChange={(e) => setNewSpanish(e.target.value)}
                  placeholder={language === "sv" ? "Spanskt ord" : "Spanish word"}
                  className="flex-1"
                />
                <Input
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder={language === "sv" ? "Översättning" : "Translation"}
                  className="flex-1"
                />
                <Button onClick={handleAdd} disabled={!newSpanish.trim() || !newTranslation.trim()}>
                  {language === "sv" ? "Spara" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredWords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {words.length === 0 
                ? (language === "sv" 
                    ? "Du har inga sparade ord än. Spara ord från konversationsövningarna!" 
                    : "You have no saved words yet. Save words from conversation exercises!")
                : (language === "sv" ? "Inga ord matchar sökningen" : "No words match your search")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredWords.map((word) => (
              <Card key={word.id} className="group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ttsSupported && (
                      <button
                        onClick={() => speak(word.spanish)}
                        className="text-muted-foreground hover:text-foreground transition"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                    <div>
                      <span className="font-medium text-foreground">{word.spanish}</span>
                      <span className="text-muted-foreground mx-2">—</span>
                      <span className="text-muted-foreground">{word.translation}</span>
                      {word.context && (
                        <p className="text-xs text-muted-foreground/70 italic mt-0.5">"{word.context}"</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeWord(word.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VocabularyPage;
