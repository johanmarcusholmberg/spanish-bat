import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { capitalizeFirst } from "@/lib/displayUtils";

interface CorrectionCardProps {
  isCorrect: boolean;
  correctAnswer: string;
  translation: string;
  details?: { label: string; value: string }[];
  exampleSentence?: { es: string; translated: string };
  children?: React.ReactNode;
}

const CorrectionCard: React.FC<CorrectionCardProps> = ({
  isCorrect,
  correctAnswer,
  translation,
  details = [],
  exampleSentence,
  children,
}) => {
  const { language } = useLanguage();
  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  return (
    <div className="space-y-3 animate-fade-in">
      <div
        className={`rounded-md px-4 py-3 border ${
          isCorrect
            ? "border-mint-dark bg-mint/10"
            : "border-destructive bg-destructive/5"
        }`}
      >
        <p
          className={`text-sm font-semibold mb-1 ${
            isCorrect ? "text-mint-dark" : "text-destructive"
          }`}
        >
          {isCorrect
            ? t("Rätt ✓", "Correct ✓")
            : t("Inte helt rätt ✗", "Not quite right ✗")}
        </p>
        <div className="text-sm text-foreground space-y-0.5">
          <p>
            <span className="text-muted-foreground">
              {t("Rätt svar:", "Correct answer:")}
            </span>{" "}
            <span className="font-medium">{correctAnswer}</span>
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("Översättning:", "Translation:")}
            </span>{" "}
            <span className="font-medium">{capitalizeFirst(translation)}</span>
          </p>
          {details.map((d, i) => (
            <p key={i}>
              <span className="text-muted-foreground">{d.label}</span>{" "}
              <span className="font-medium">{d.value}</span>
            </p>
          ))}
        </div>
      </div>

      {children}

      {exampleSentence && (
        <div className="bg-background rounded-md px-3 py-2 text-sm italic text-muted-foreground">
          "{exampleSentence.es}" — {exampleSentence.translated}
        </div>
      )}
    </div>
  );
};

export default CorrectionCard;
