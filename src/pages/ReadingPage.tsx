import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { readingTexts } from "@/data/readingTexts";
import { getItemsForLevel } from "@/data/spanishData";
import { BookOpen, Check, X, ArrowRight } from "lucide-react";

const ReadingPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [textIndex, setTextIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const texts = useMemo(
    () => getItemsForLevel(readingTexts, user?.level || "A1"),
    [user?.level]
  );

  const current = texts[textIndex % texts.length];
  if (!current) return <AppLayout><p>No texts available.</p></AppLayout>;

  const handleSelect = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  };

  const handleSubmit = () => setSubmitted(true);

  const handleNext = () => {
    setTextIndex((i) => i + 1);
    setAnswers({});
    setSubmitted(false);
  };

  const correctCount = submitted
    ? current.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          {t("reading")}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{t("readingDesc")}</p>

        {/* Text info */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-foreground text-lg">
            {current.title[language]}
          </h2>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {current.level}
          </span>
        </div>

        {/* Reading text */}
        <div className="bg-card rounded-lg p-5 shadow-soft mb-6">
          <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
            {current.text}
          </p>
        </div>

        {/* Questions */}
        <h3 className="font-heading font-bold text-foreground mb-3">{t("questions")}</h3>
        <div className="space-y-4 mb-6">
          {current.questions.map((q, qi) => (
            <div key={qi} className="bg-card rounded-lg p-4 shadow-soft">
              <p className="font-medium text-foreground text-sm mb-3">
                {qi + 1}. {q.question[language]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = q.correctIndex === oi;
                  let cls = "border border-border bg-background text-foreground hover:bg-muted";
                  if (submitted && isCorrect) {
                    cls = "border-2 border-secondary bg-secondary/20 text-foreground";
                  } else if (submitted && selected && !isCorrect) {
                    cls = "border-2 border-destructive bg-destructive/10 text-foreground";
                  } else if (selected) {
                    cls = "border-2 border-primary bg-primary/10 text-foreground";
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${cls}`}
                    >
                      {submitted && isCorrect && <Check className="h-4 w-4 text-secondary-foreground" />}
                      {submitted && selected && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit / Result */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < current.questions.length}
            className="w-full py-3 rounded-lg gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50"
          >
            {t("checkAnswer")}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-card rounded-lg p-4 shadow-soft text-center">
              <p className="font-heading font-bold text-foreground text-lg">
                {correctCount} / {current.questions.length} {t("correct").toLowerCase()}!
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-lg gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {t("nextText")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ReadingPage;
