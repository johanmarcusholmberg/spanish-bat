import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Trash2,
  Volume2,
  Plus,
  Search,
  GraduationCap,
  Edit3,
  CheckCircle2,
  Circle,
  Filter,
} from "lucide-react";
import { useVocabulary, VocabularyWord } from "@/hooks/useVocabulary";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import VocabularyPractice from "@/components/vocabulary/VocabularyPractice";

type FilterType = "all" | "word" | "phrase" | "sentence";
type FilterLearned = "all" | "learned" | "unlearned";

const VocabularyPage = () => {
  const { language } = useLanguage();
  const { words, loading, addWord, removeWord, updateWord, toggleLearned } = useVocabulary();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterLearned, setFilterLearned] = useState<FilterLearned>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newSpanish, setNewSpanish] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);

  // Edit dialog
  const [editWord, setEditWord] = useState<VocabularyWord | null>(null);
  const [editSpanish, setEditSpanish] = useState("");
  const [editTranslation, setEditTranslation] = useState("");

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchesSearch =
        w.spanish.toLowerCase().includes(search.toLowerCase()) ||
        w.translation.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || w.item_type === filterType;
      const matchesLearned =
        filterLearned === "all" ||
        (filterLearned === "learned" && w.learned) ||
        (filterLearned === "unlearned" && !w.learned);
      return matchesSearch && matchesType && matchesLearned;
    });
  }, [words, search, filterType, filterLearned]);

  const stats = useMemo(() => ({
    total: words.length,
    learned: words.filter(w => w.learned).length,
    words: words.filter(w => w.item_type === "word").length,
    phrases: words.filter(w => w.item_type === "phrase").length,
    sentences: words.filter(w => w.item_type === "sentence").length,
  }), [words]);

  const unlearnedWords = useMemo(() => words.filter(w => !w.learned), [words]);

  const handleAdd = async () => {
    if (!newSpanish.trim() || !newTranslation.trim()) return;
    const success = await addWord(newSpanish, newTranslation);
    if (success) {
      setNewSpanish("");
      setNewTranslation("");
      setShowAdd(false);
    }
  };

  const openEdit = (word: VocabularyWord) => {
    setEditWord(word);
    setEditSpanish(word.spanish);
    setEditTranslation(word.translation);
  };

  const saveEdit = async () => {
    if (!editWord || !editSpanish.trim() || !editTranslation.trim()) return;
    await updateWord(editWord.id, {
      spanish: editSpanish.trim(),
      translation: editTranslation.trim(),
    });
    setEditWord(null);
  };

  if (practiceMode && unlearnedWords.length >= 3) {
    return (
      <AppLayout>
        <VocabularyPractice
          words={unlearnedWords}
          allWords={words}
          onExit={() => setPracticeMode(false)}
          onToggleLearned={toggleLearned}
        />
      </AppLayout>
    );
  }

  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {t("Min ordbok", "My Dictionary")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} {t("ord", "words")} · {stats.learned} {t("lärda", "learned")}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{stats.words}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t("Ord", "Words")}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{stats.phrases}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t("Fraser", "Phrases")}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{stats.sentences}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t("Meningar", "Sentences")}</p>
          </CardContent></Card>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Sök ord...", "Search words...")}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4 mr-1" /> {t("Lägg till", "Add")}
          </Button>
          {unlearnedWords.length >= 3 && (
            <Button size="sm" onClick={() => setPracticeMode(true)}>
              <GraduationCap className="h-4 w-4 mr-1" /> {t("Öva", "Practice")}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Alla typer", "All types")}</SelectItem>
              <SelectItem value="word">{t("Ord", "Words")}</SelectItem>
              <SelectItem value="phrase">{t("Fraser", "Phrases")}</SelectItem>
              <SelectItem value="sentence">{t("Meningar", "Sentences")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLearned} onValueChange={(v) => setFilterLearned(v as FilterLearned)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Alla", "All")}</SelectItem>
              <SelectItem value="learned">{t("Lärda", "Learned")}</SelectItem>
              <SelectItem value="unlearned">{t("Ej lärda", "Unlearned")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add form */}
        {showAdd && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newSpanish}
                  onChange={(e) => setNewSpanish(e.target.value)}
                  placeholder={t("Spanskt ord", "Spanish word")}
                  className="flex-1"
                />
                <Input
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder={t("Översättning", "Translation")}
                  className="flex-1"
                />
                <Button onClick={handleAdd} disabled={!newSpanish.trim() || !newTranslation.trim()}>
                  {t("Spara", "Save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Word list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredWords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {words.length === 0
                ? t("Du har inga sparade ord än. Markera text i konversationsövningar för att spara!",
                    "You have no saved words yet. Select text in conversation exercises to save!")
                : t("Inga ord matchar din sökning", "No words match your search")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {filteredWords.map((word) => (
              <Card key={word.id} className="group">
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Learned toggle */}
                  <button
                    onClick={() => toggleLearned(word.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition"
                    title={word.learned ? t("Markera som ej lärd", "Mark as unlearned") : t("Markera som lärd", "Mark as learned")}
                  >
                    {word.learned ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* TTS */}
                  {ttsSupported && (
                    <button
                      onClick={() => speak(word.spanish)}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground transition"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-foreground ${word.learned ? "line-through opacity-60" : ""}`}>
                        {word.spanish}
                      </span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-muted-foreground truncate">{word.translation}</span>
                    </div>
                    {word.context && (
                      <p className="text-xs text-muted-foreground/70 italic mt-0.5 truncate">"{word.context}"</p>
                    )}
                  </div>

                  {/* Type badge */}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                    {word.item_type === "word" ? t("Ord", "Word") : word.item_type === "phrase" ? t("Fras", "Phrase") : t("Mening", "Sentence")}
                  </Badge>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      onClick={() => openEdit(word)}
                      className="text-muted-foreground hover:text-foreground transition p-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeWord(word.id)}
                      className="text-muted-foreground hover:text-destructive transition p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editWord} onOpenChange={(open) => !open && setEditWord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Redigera ord", "Edit word")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={editSpanish}
              onChange={(e) => setEditSpanish(e.target.value)}
              placeholder={t("Spanskt ord", "Spanish word")}
            />
            <Input
              value={editTranslation}
              onChange={(e) => setEditTranslation(e.target.value)}
              placeholder={t("Översättning", "Translation")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWord(null)}>
              {t("Avbryt", "Cancel")}
            </Button>
            <Button onClick={saveEdit} disabled={!editSpanish.trim() || !editTranslation.trim()}>
              {t("Spara", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default VocabularyPage;
