import React from "react";
import { BookmarkPlus, Languages, Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isLast: boolean;
  isLoading: boolean;
  onTranslate: (content: string) => void;
  onSaveWords: (content: string) => void;
  onSpeak?: (content: string) => void;
  ttsSupported?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  isLast,
  isLoading,
  onTranslate,
  onSaveWords,
  onSpeak,
  ttsSupported,
}) => {
  const { language } = useLanguage();
  const isUser = role === "user";
  const showActions = content && !isLoading;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-background"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
        {showActions && (
          <div className="mt-2 flex items-center justify-end gap-3">
            {ttsSupported && onSpeak && (
              <button
                onClick={() => onSpeak(content)}
                className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => onTranslate(content)}
              className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
            >
              <Languages className="h-3.5 w-3.5" />
              {language === "sv" ? "Översätt" : "Translate"}
            </button>
            <button
              onClick={() => onSaveWords(content)}
              className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              {language === "sv" ? "Spara ord" : "Save words"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
