import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { grammarLessons, GrammarLesson } from "@/data/grammarLessons";
import { getItemsForLevel } from "@/data/spanishData";
import { BookOpen, ChevronRight, ChevronDown, Lightbulb } from "lucide-react";

const GrammarPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [openLesson, setOpenLesson] = useState<string | null>(null);

  const lessons = getItemsForLevel(grammarLessons, user?.level || "A1");

  // Group by level
  const grouped = lessons.reduce<Record<string, GrammarLesson[]>>((acc, l) => {
    (acc[l.level] = acc[l.level] || []).push(l);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          {t("grammarLessons")}
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">{t("grammarDesc")}</p>

        <div className="space-y-6">
          {Object.entries(grouped).map(([level, items]) => (
            <div key={level}>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                {t(`level${level}`)}
              </h2>
              <div className="space-y-2">
                {items.map((lesson) => {
                  const isOpen = openLesson === lesson.id;
                  return (
                    <div key={lesson.id} className="bg-card rounded-lg shadow-soft overflow-hidden">
                      <button
                        onClick={() => setOpenLesson(isOpen ? null : lesson.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition"
                      >
                        <span className="font-heading font-bold text-foreground">
                          {lesson.title[language]}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-5 border-t border-border pt-4">
                          {lesson.sections.map((section, si) => (
                            <div key={si}>
                              <h3 className="font-heading font-bold text-foreground mb-2">
                                {section.heading[language]}
                              </h3>
                              <p className="text-foreground text-sm leading-relaxed mb-3">
                                {section.explanation[language]}
                              </p>
                              <div className="bg-background rounded-md p-3 space-y-1.5 mb-3">
                                {section.examples.map((ex, ei) => (
                                  <div key={ei} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                                    <span className="font-semibold text-accent-foreground">{ex.es}</span>
                                    <span className="text-muted-foreground">
                                      — {language === "sv" ? ex.sv : ex.en}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {section.tip && (
                                <div className="flex items-start gap-2 bg-primary/10 rounded-md p-3">
                                  <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                  <p className="text-sm text-foreground">{section.tip[language]}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default GrammarPage;
