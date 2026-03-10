import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SelectionPopup from "@/components/SelectionPopup";
import {
  Lightbulb,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2,
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
    icon: "🧭",
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/conversation`;

const ConversationPage = () => {
  const { language } = useLanguage();
  const { user, session } = useAuth();
  const { toast } = useToast();
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
  const { addWord } = useVocabulary();

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

  const getAuthHeaders = useCallback(() => {
    if (!session?.access_token) {
      throw new Error(
        language === "sv"
          ? "Du måste vara inloggad för att använda konversationsövningen."
          : "You need to be signed in to use conversation practice."
      );
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };
  }, [language, session?.access_token]);

  const streamChat = useCallback(
    async (
      allMessages: Message[],
      scenario: Scenario,
      onDelta: (text: string) => void
    ) => {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          level: user?.level || "A1",
          scenario: scenario.scenario,
          learningFrom: user?.learningFrom || "sv",
          messages: allMessages,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) {
            line = line.slice(0, -1);
          }

          if (!line.trim() || line.startsWith(":")) {
            newlineIndex = buffer.indexOf("\n");
            continue;
          }

          if (!line.startsWith("data: ")) {
            newlineIndex = buffer.indexOf("\n");
            continue;
          }

          const payload = line.slice(6).trim();

          if (payload === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onDelta(content);
            }
          } catch {
            // ignore malformed partial chunk
          }

          newlineIndex = buffer.indexOf("\n");
        }
      }
    },
    [getAuthHeaders, user?.learningFrom, user?.level]
  );

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
        const message =
          error instanceof Error ? error.message : "Unknown error";
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

          setMessages(() => {
            return [...nextMessages, { role: "assistant", content: assistantSoFar }];
          });
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
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
    [
      isLoading,
      language,
      messages,
      resetTranscript,
      selectedScenario,
      streamChat,
      toast,
    ]
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
      <div className="mx-auto max-w-5xl space-y-6">
        {!selectedScenario ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6" />
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => void startConversation(scenario)}
                  className="rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 text-3xl">{scenario.icon}</div>
                  <h2 className="text-lg font-semibold">
                    {language === "sv" ? scenario.titleSv : scenario.titleEn}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === "sv" ? scenario.descSv : scenario.descEn}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-3xl">{selectedScenario.icon}</div>
                <h1 className="text-2xl font-bold">
                  {language === "sv"
                    ? selectedScenario.titleSv
                    : selectedScenario.titleEn}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {ttsSupported && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <span className="text-sm">
                      {language === "sv" ? "Auto-läs" : "Auto-read"}
                    </span>
                    <Switch checked={autoRead} onCheckedChange={setAutoRead} />
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

            <div className="rounded-2xl border bg-card p-4">
              <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-2">
                {messages.map((msg, i) => (
                  <div
                    key={`${msg.role}-${i}`}
                    className={`rounded-2xl p-4 ${
                      msg.role === "user"
                        ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                        : "mr-auto max-w-[85%] bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">{msg.content}</p>

                    {msg.role === "assistant" && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {ttsSupported && (
                          <button
                            type="button"
                            onClick={() => speak(msg.content)}
                            className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                            title={language === "sv" ? "Lyssna" : "Listen"}
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSaveWord(i)}
                          className={`rounded-md p-1 transition ${
                            saveWordMode === i
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={language === "sv" ? "Spara ord" : "Save word"}
                        >
                          <BookPlus className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {saveWordMode === i && (
                      <div className="mt-3 grid gap-2 rounded-xl border bg-background p-3">
                        <p className="text-xs text-muted-foreground">
                          {language === "sv"
                            ? "Skriv ett ord eller en fras att spara:"
                            : "Enter a word or phrase to save:"}
                        </p>

                        <Input
                          value={selectedText}
                          onChange={(e) => setSelectedText(e.target.value)}
                          placeholder={
                            language === "sv" ? "Spanskt ord/fras" : "Spanish word/phrase"
                          }
                        />
                        <Input
                          value={wordTranslation}
                          onChange={(e) => setWordTranslation(e.target.value)}
                          placeholder={language === "sv" ? "Översättning" : "Translation"}
                        />
                        <Button onClick={confirmSaveWord}>
                          {language === "sv" ? "Spara" : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === "sv" ? "Skriver..." : "Typing..."}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => sendSpecial("[HINT]")}
                disabled={isLoading || messages.length === 0}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {language === "sv" ? "Ledtråd" : "Hint"}
              </Button>

              <Button
                variant="outline"
                onClick={() => sendSpecial("[TRANSLATE]")}
                disabled={isLoading || messages.length === 0}
              >
                {language === "sv" ? "Översätt" : "Translate"}
              </Button>
            </div>

            {isListening && interimTranscript && (
              <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
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
                  variant="outline"
                  onClick={handleMicToggle}
                  disabled={isLoading}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === "sv"
                    ? "Skriv eller tala spanska..."
                    : "Type or speak Spanish..."
                }
                disabled={isLoading || isListening}
                className="flex-1"
              />

              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ConversationPage;
