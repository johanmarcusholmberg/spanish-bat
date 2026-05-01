import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface LevelPracticeSelectorProps {
  practiceLevel: Level;
  onLevelChange: (level: Level) => void;
}

const LevelPracticeSelector = ({ practiceLevel, onLevelChange }: LevelPracticeSelectorProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const currentLevel = (user?.level || "A1") as Level;
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);

  // Allow current + all previous levels
  const availableLevels = LEVEL_ORDER.slice(0, currentIdx + 1);

  if (availableLevels.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{t("practiceLevel")}:</span>
      <Select value={practiceLevel} onValueChange={(v) => onLevelChange(v as Level)}>
        <SelectTrigger className="w-auto h-8 text-sm gap-1.5 min-w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLevels.map((lvl) => (
            <SelectItem key={lvl} value={lvl}>
              {lvl} {lvl === currentLevel ? `(${t("currentLevelTag")})` : `(${t("reviewTag")})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LevelPracticeSelector;
