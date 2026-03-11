import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useConversationStream } from "@/hooks/useConversationStream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SentenceWordPicker from "@/components/vocabulary/SentenceWordPicker";
import {
  BookmarkPlus,
  Lightbulb,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  X,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Scenario {
  id: string;
  icon: string;
  titleSv: string;
  titleEn: string;
  descSv: string;
  descEn: string;
  scenario: string;
}

const scenarios: Scenario[] = [
  {
    id: "cafe",
    icon: "☕",
    titleSv: "På caféet",
    titleEn: "At the café",
    descSv: "Beställ kaffe och småprata",
    descEn: "Order coffee and make small talk",
    scenario: "ordering at a café",
  },
  {
    id: "market",
    icon: "🛍️",
    titleSv: "På marknaden",
    titleEn: "At the market",
    descSv: "Handla frukt och grönsaker",
    descEn: "Buy fruits and vegetables",
    scenario: "shopping at an outdoor market",
  },
  {
    id: "directions",
    icon: "🗺️",
    titleSv: "Fråga om vägen",
    titleEn: "Asking for directions",
    descSv: "Hitta till museet",
    descEn: "Find your way to the museum",
    scenario: "asking a local for directions to the museum",
  },
  {
    id: "hotel",
    icon: "🏨",
    titleSv: "På hotellet",
    titleEn: "At the hotel",
    descSv: "Checka in och fråga om rummet",
    descEn: "Check in and ask about the room",
    scenario: "checking into a hotel",
  },
  {
    id: "restaurant",
    icon: "🍽️",
    titleSv: "På restaurangen",
    titleEn: "At the restaurant",
    descSv: "Beställ mat och dryck",
    descEn: "Order food and drinks",
    scenario: "dining at a restaurant",
  },
  {
    id: "doctor",
    icon: "🩺",
    titleSv: "Hos läkaren",
    titleEn: "At the doctor",
    descSv: "Beskriv symptom",
    descEn: "Describe symptoms",
    scenario: "visiting the doctor and describing symptoms",
  },
  {
    id: "friend",
    icon: "👋",
    titleSv: "Träffa en vän",
    titleEn: "Meeting a friend",
    descSv: "Planera helgen",
    descEn: "Plan the weekend",
    scenario: "meeting a friend and planning weekend activities",
  },
  {
    id: "job",
    icon: "💼",
    titleSv: "Jobbintervju",
    titleEn: "Job interview",
    descSv: "Presentera dig själv",
    descEn: "Present yourself",
    scenario: "a casual job interview at a local shop",
  },
];

const ConversationPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { streamChat } = useConversationStream();
  const { speak, stop: stopTTS, isSupported: ttsSupported } = useSpanishTTS();
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: sttSupported,
  } = useSpanishSTT();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRead, setAutoRead] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastAssistantMsgRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!autoRead || !ttsSupported || isLoading) return;

    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg?.role === "assistant" &&
      lastMsg.content &&
      lastMsg.content !== lastAssistantMsgRef.current
    ) {
      lastAssistantMsgRef.current = lastMsg.content;
      speak(lastMsg.content);
    }
  }, [messages, autoRead, ttsSupported, isLoading, speak]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const startConversation = useCallback(
    async (scenario: Scenario) => {
      setSelectedScenario(scenario);
      setMessages([]);
      setInput("");
      setIsLoading(true);
      lastAssistantMsgRef.current = "";

      let assistantSoFar = "";

      try {
        await streamChat([], scenario, (chunk) => {
          assistantSoFar += chunk;
          setMessages([{ role: "assistant", content: assistantSoFar }]);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast({
          title: language === "sv" ? "Fel" : "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [language, streamChat, toast]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!selectedScenario || !text.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];

      setMessages(nextMessages);
      setInput("");
      resetTranscript();
      setIsLoading(true);

      let assistantSoFar = "";

      try {
        await streamChat(nextMessages, selectedScenario, (chunk) => {
          assistantSoFar += chunk;
          setMessages([...nextMessages, { role: "assistant", content: assistantSoFar }]);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast({
          title: language === "sv" ? "Fel" : "Error",
          description: message,
          variant: "destructive",
        });
        setMessages(nextMessages);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, language, messages, resetTranscript, selectedScenario, streamChat, toast]
  );

  const sendSpecial = (cmd: string) => {
    if (!isLoading) {
      void sendMessage(cmd);
    }
  };

  const endConversation = () => {
    if (isLoading) return;
    stopTTS();
    void sendMessage("[END]");
  };

  const resetConversation = () => {
    stopTTS();
    setSelectedScenario(null);
    setMessages([]);
    setInput("");
    setIsLoading(false);
    lastAssistantMsgRef.current = "";
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        setTimeout(() => {
          void sendMessage(transcript.trim());
        }, 100);
      }
      return;
    }

    resetTranscript();
    setInput("");
    startListening();
  };

  return (
    <AppLayout>
      {!selectedScenario ? (
        <>
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold">
                {language === "sv" ? "Konversationsövning" : "Conversation Practice"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {language === "sv"
                ? "Öva vardagssamtal med en AI-partner."
                : "Practice everyday conversations with an AI partner."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => void startConversation(scenario)}
                className="rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{scenario.icon}</div>
                <h2 className="mb-1 text-lg font-semibold">
                  {language === "sv" ? scenario.titleSv : scenario.titleEn}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === "sv" ? scenario.descSv : scenario.descEn}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selectedScenario.icon}</div>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === "sv" ? selectedScenario.titleSv : selectedScenario.titleEn}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ttsSupported && (
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <Switch checked={autoRead} onCheckedChange={setAutoRead} />
                  <span className="text-sm">
                    {language === "sv" ? "Auto-läs" : "Auto-read"}
                  </span>
                </div>
              )}

              <Button variant="outline" onClick={resetConversation}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {language === "sv" ? "Nytt" : "New"}
              </Button>

              <Button variant="destructive" onClick={endConversation} disabled={isLoading}>
                <X className="mr-2 h-4 w-4" />
                {language === "sv" ? "Avsluta" : "End"}
              </Button>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="mb-4 max-h-[55vh] overflow-y-auto rounded-2xl border bg-card p-4"
          >
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-background"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && msg.content && !isLoading && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => setPickerMessage(msg.content)}
                          className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
                        >
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          {language === "sv" ? "Spara ord" : "Save words"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === "sv" ? "Skriver..." : "Typing..."}
                </div>
              )}
            </div>
          </div>

          {pickerMessage && (
            <SentenceWordPicker
              sentence={pickerMessage}
              context="conversation"
              open={!!pickerMessage}
              onOpenChange={(open) => { if (!open) setPickerMessage(null); }}
            />
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => sendSpecial("[HINT]")}
              disabled={isLoading || messages.length === 0}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              {language === "sv" ? "Ledtråd" : "Hint"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => sendSpecial("[TRANSLATE]")}
              disabled={isLoading || messages.length === 0}
            >
              {language === "sv" ? "Översätt" : "Translate"}
            </Button>
          </div>

          {isListening && interimTranscript && (
            <div className="mb-3 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
              {interimTranscript}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            {sttSupported && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={handleMicToggle}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === "sv" ? "Skriv eller tala spanska..." : "Type or speak Spanish..."
              }
              disabled={isLoading || isListening}
              className="flex-1"
            />

            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="mr-2 h-4 w-4" />
              {language === "sv" ? "Skicka" : "Send"}
            </Button>
          </form>
        </>
      )}
    </AppLayout>
  );
};

export default ConversationPage;
