import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useConversationStream } from "@/hooks/useConversationStream";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SentenceWordPicker from "@/components/vocabulary/SentenceWordPicker";
import HelperPanel from "@/components/conversation/HelperPanel";
import MessageBubble from "@/components/conversation/MessageBubble";
import SpeechReviewPanel from "@/components/conversation/SpeechReviewPanel";
import {
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Pencil,
  Send,
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
  { id: "cafe", icon: "☕", titleSv: "På caféet", titleEn: "At the café", descSv: "Beställ kaffe och småprata", descEn: "Order coffee and make small talk", scenario: "ordering at a café" },
  { id: "market", icon: "🛍️", titleSv: "På marknaden", titleEn: "At the market", descSv: "Handla frukt och grönsaker", descEn: "Buy fruits and vegetables", scenario: "shopping at an outdoor market" },
  { id: "directions", icon: "🗺️", titleSv: "Fråga om vägen", titleEn: "Asking for directions", descSv: "Hitta till museet", descEn: "Find your way to the museum", scenario: "asking a local for directions to the museum" },
  { id: "hotel", icon: "🏨", titleSv: "På hotellet", titleEn: "At the hotel", descSv: "Checka in och fråga om rummet", descEn: "Check in and ask about the room", scenario: "checking into a hotel" },
  { id: "restaurant", icon: "🍽️", titleSv: "På restaurangen", titleEn: "At the restaurant", descSv: "Beställ mat och dryck", descEn: "Order food and drinks", scenario: "dining at a restaurant" },
  { id: "doctor", icon: "🩺", titleSv: "Hos läkaren", titleEn: "At the doctor", descSv: "Beskriv symptom", descEn: "Describe symptoms", scenario: "visiting the doctor and describing symptoms" },
  { id: "friend", icon: "👋", titleSv: "Träffa en vän", titleEn: "Meeting a friend", descSv: "Planera helgen", descEn: "Plan the weekend", scenario: "meeting a friend and planning weekend activities" },
  { id: "job", icon: "💼", titleSv: "Jobbintervju", titleEn: "Job interview", descSv: "Presentera dig själv", descEn: "Present yourself", scenario: "a casual job interview at a local shop" },
];

const ConversationPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { streamChat } = useConversationStream();
  const { speak, stop: stopTTS, isSupported: ttsSupported } = useSpanishTTS();
  const { translate, isTranslating } = useTranslate();
  const {
    isListening, transcript, interimTranscript,
    startListening, stopListening, resetTranscript,
    isSupported: sttSupported,
  } = useSpanishSTT();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [pickerMessage, setPickerMessage] = useState<string | null>(null);
  const [freestyleInput, setFreestyleInput] = useState("");
  const [showFreestyleForm, setShowFreestyleForm] = useState(false);

  // Helper panel state
  const [helperType, setHelperType] = useState<"hint" | "translate" | null>(null);
  const [helperContent, setHelperContent] = useState("");
  const [helperLoading, setHelperLoading] = useState(false);

  // Speech review state
  const [speechReviewText, setSpeechReviewText] = useState<string | null>(null);
  const [speechCoaching, setSpeechCoaching] = useState<string | null>(null);
  const [speechCoachingLoading, setSpeechCoachingLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastAssistantMsgRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!autoRead || !ttsSupported || isLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.content && lastMsg.content !== lastAssistantMsgRef.current) {
      lastAssistantMsgRef.current = lastMsg.content;
      speak(lastMsg.content);
    }
  }, [messages, autoRead, ttsSupported, isLoading, speak]);

  // Only sync transcript to input when actively listening (live preview)
  useEffect(() => {
    if (isListening && transcript) setInput(transcript);
  }, [transcript, isListening]);

  const startConversation = useCallback(async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setInput("");
    setIsLoading(true);
    setHelperType(null);
    setHelperContent("");
    lastAssistantMsgRef.current = "";

    let assistantSoFar = "";
    try {
      await streamChat([], scenario, (chunk) => {
        assistantSoFar += chunk;
        setMessages([{ role: "assistant", content: assistantSoFar }]);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({ title: language === "sv" ? "Fel" : "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [language, streamChat, toast]);

  const handleFreestyleStart = () => {
    if (!freestyleInput.trim()) return;
    const customScenario: Scenario = {
      id: "freestyle", icon: "✏️",
      titleSv: freestyleInput.trim(), titleEn: freestyleInput.trim(),
      descSv: "", descEn: "",
      scenario: freestyleInput.trim(),
    };
    setShowFreestyleForm(false);
    void startConversation(customScenario);
  };

  const sendMessage = useCallback(async (text: string) => {
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
      toast({ title: language === "sv" ? "Fel" : "Error", description: message, variant: "destructive" });
      setMessages(nextMessages);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language, messages, resetTranscript, selectedScenario, streamChat, toast]);

  // Hint: stream into helper panel, don't add to conversation
  const requestHint = useCallback(async () => {
    if (!selectedScenario || isLoading || helperLoading || messages.length === 0) return;
    setHelperType("hint");
    setHelperContent("");
    setHelperLoading(true);

    // Send [HINT] with current messages but capture response separately
    const hintMessages: Message[] = [...messages, { role: "user", content: "[HINT]" }];
    let result = "";
    try {
      await streamChat(hintMessages, selectedScenario, (chunk) => {
        result += chunk;
        setHelperContent(result);
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setHelperContent(msg);
    } finally {
      setHelperLoading(false);
    }
  }, [selectedScenario, isLoading, helperLoading, messages, streamChat]);

  // Translate a specific message using the translate-word edge function
  const handleTranslateMessage = useCallback(async (content: string) => {
    if (isTranslating || helperLoading) return;
    setHelperType("translate");
    setHelperContent("");
    setHelperLoading(true);

    const targetLang = language === "sv" ? "sv" : "en";
    try {
      const result = await translate(content, targetLang);
      if (result) {
        setHelperContent(result.translation);
      } else {
        // Fallback: use conversation edge function for longer text
        const translateMessages: Message[] = [
          ...messages,
          { role: "user", content: "[TRANSLATE]" },
        ];
        // Find the message in conversation and ask for translation
        let streamed = "";
        await streamChat(
          [...messages.filter(m => m.content !== content), { role: "assistant", content }, { role: "user", content: "[TRANSLATE]" }],
          selectedScenario!,
          (chunk) => {
            streamed += chunk;
            setHelperContent(streamed);
          }
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setHelperContent(msg);
    } finally {
      setHelperLoading(false);
    }
  }, [isTranslating, helperLoading, language, translate, messages, streamChat, selectedScenario]);

  const endConversation = () => {
    if (isLoading) return;
    stopTTS();
    void sendMessage("[END]");
  };

  const goBack = () => {
    stopTTS();
    setSelectedScenario(null);
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setShowFreestyleForm(false);
    setHelperType(null);
    setHelperContent("");
    lastAssistantMsgRef.current = "";
  };

  // Request coaching feedback on speech input before sending
  const requestSpeechCoaching = useCallback(async (text: string) => {
    if (!selectedScenario || !text.trim()) return;
    setSpeechCoachingLoading(true);
    setSpeechCoaching(null);
    const reviewMessages: Message[] = [
      ...messages,
      { role: "user", content: `[REVIEW] ${text}` },
    ];
    let result = "";
    try {
      await streamChat(reviewMessages, selectedScenario, (chunk) => {
        result += chunk;
        setSpeechCoaching(result);
      });
    } catch {
      setSpeechCoaching(null);
    } finally {
      setSpeechCoachingLoading(false);
    }
  }, [selectedScenario, messages, streamChat]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      // Don't auto-send — show review panel instead
      return;
    }
    // Start fresh recording
    resetTranscript();
    setInput("");
    setSpeechReviewText(null);
    setSpeechCoaching(null);
    startListening();
  };

  // When STT stops and we have a transcript, show review panel
  useEffect(() => {
    if (!isListening && transcript.trim() && speechReviewText === null) {
      const text = transcript.trim();
      setSpeechReviewText(text);
      setInput(text);
      // Auto-request coaching
      void requestSpeechCoaching(text);
    }
  }, [isListening, transcript]);

  const handleSpeechSend = (text: string) => {
    setSpeechReviewText(null);
    setSpeechCoaching(null);
    resetTranscript();
    void sendMessage(text);
  };

  const handleSpeechRetry = () => {
    setSpeechReviewText(null);
    setSpeechCoaching(null);
    resetTranscript();
    setInput("");
    startListening();
  };

  const handleSpeechDismiss = () => {
    setSpeechReviewText(null);
    setSpeechCoaching(null);
    resetTranscript();
    setInput("");
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

            {!showFreestyleForm ? (
              <button
                onClick={() => setShowFreestyleForm(true)}
                className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-md"
              >
                <div className="mb-3 text-3xl">
                  <Pencil className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-1 text-lg font-semibold">
                  {language === "sv" ? "Eget scenario" : "Custom scenario"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === "sv"
                    ? "Beskriv din egen situation att öva"
                    : "Describe your own situation to practice"}
                </p>
              </button>
            ) : (
              <div className="rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    {language === "sv" ? "Eget scenario" : "Custom scenario"}
                  </h2>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {language === "sv"
                    ? "Beskriv situationen på engelska eller svenska"
                    : "Describe the situation in English or Swedish"}
                </p>
                <Input
                  value={freestyleInput}
                  onChange={(e) => setFreestyleInput(e.target.value)}
                  placeholder={language === "sv" ? "T.ex. köpa biljett på tågstationen..." : "E.g. buying a train ticket at the station..."}
                  className="mb-3"
                  onKeyDown={(e) => { if (e.key === "Enter") handleFreestyleStart(); }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleFreestyleStart} disabled={!freestyleInput.trim()} size="sm">
                    {language === "sv" ? "Starta" : "Start"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowFreestyleForm(false); setFreestyleInput(""); }}>
                    {language === "sv" ? "Avbryt" : "Cancel"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selectedScenario.icon}</div>
              <h1 className="text-2xl font-bold">
                {language === "sv" ? selectedScenario.titleSv : selectedScenario.titleEn}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ttsSupported && (
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <Switch checked={autoRead} onCheckedChange={setAutoRead} />
                  <span className="text-sm">{language === "sv" ? "Auto-läs" : "Auto-read"}</span>
                </div>
              )}
              <Button variant="outline" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === "sv" ? "Tillbaka" : "Go back"}
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="mb-4 max-h-[55vh] overflow-y-auto rounded-2xl border bg-card p-4">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isLast={i === messages.length - 1}
                  isLoading={isLoading}
                  onTranslate={handleTranslateMessage}
                  onSaveWords={setPickerMessage}
                  onSpeak={ttsSupported ? speak : undefined}
                  ttsSupported={ttsSupported}
                />
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

          {/* Helper panel for hint/translate */}
          <HelperPanel
            type={helperType}
            content={helperContent}
            isLoading={helperLoading}
            onClose={() => { setHelperType(null); setHelperContent(""); }}
          />

          {pickerMessage && (
            <SentenceWordPicker
              sentence={pickerMessage}
              context="conversation"
              open={!!pickerMessage}
              onOpenChange={(open) => { if (!open) setPickerMessage(null); }}
            />
          )}

          {/* Helper actions + End */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestHint}
              disabled={isLoading || helperLoading || messages.length === 0}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              {language === "sv" ? "Ledtråd" : "Hint"}
            </Button>

            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={endConversation}
                disabled={isLoading || messages.length === 0}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {language === "sv" ? "Avsluta & sammanfatta" : "Finish & summarize"}
              </Button>
            </div>
          </div>

          {/* Interim transcript */}
          {isListening && interimTranscript && (
            <div className="mb-3 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
              {interimTranscript}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }}
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
              placeholder={language === "sv" ? "Skriv eller tala spanska..." : "Type or speak Spanish..."}
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
