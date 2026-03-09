import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Lightbulb, Languages, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  { id: "market", icon: "🛒", titleSv: "På marknaden", titleEn: "At the market", descSv: "Handla frukt och grönsaker", descEn: "Buy fruits and vegetables", scenario: "shopping at an outdoor market" },
  { id: "directions", icon: "🗺️", titleSv: "Fråga om vägen", titleEn: "Asking for directions", descSv: "Hitta till museet", descEn: "Find your way to the museum", scenario: "asking a local for directions to the museum" },
  { id: "hotel", icon: "🏨", titleSv: "På hotellet", titleEn: "At the hotel", descSv: "Checka in och fråga om rummet", descEn: "Check in and ask about the room", scenario: "checking into a hotel" },
  { id: "restaurant", icon: "🍽️", titleSv: "På restaurangen", titleEn: "At the restaurant", descSv: "Beställ mat och dryck", descEn: "Order food and drinks", scenario: "dining at a restaurant" },
  { id: "doctor", icon: "🏥", titleSv: "Hos läkaren", titleEn: "At the doctor", descSv: "Beskriv symptom", descEn: "Describe symptoms", scenario: "visiting the doctor and describing symptoms" },
  { id: "friend", icon: "👋", titleSv: "Träffa en vän", titleEn: "Meeting a friend", descSv: "Planera helgen", descEn: "Plan the weekend", scenario: "meeting a friend and planning weekend activities" },
  { id: "job", icon: "💼", titleSv: "Jobbintervju", titleEn: "Job interview", descSv: "Presentera dig själv", descEn: "Present yourself", scenario: "a casual job interview at a local shop" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/conversation`;

const ConversationPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (allMessages: Message[], onDelta: (text: string) => void, onDone: () => void) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        level: user?.level || "A1",
        scenario: selectedScenario?.scenario || "",
        learningFrom: user?.learningFrom || "sv",
        messages: allMessages,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || `Error ${resp.status}`);
    }
    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
    onDone();
  };

  const startConversation = async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setIsLoading(true);

    let assistantSoFar = "";
    const initialMessages: Message[] = [];

    try {
      await streamChat(initialMessages, (chunk) => {
        assistantSoFar += chunk;
        setMessages([{ role: "assistant", content: assistantSoFar }]);
      }, () => setIsLoading(false));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      await streamChat(newMessages, (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > newMessages.length) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...newMessages, { role: "assistant", content: assistantSoFar }];
        });
      }, () => setIsLoading(false));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const sendSpecial = (cmd: string) => {
    if (isLoading) return;
    sendMessage(cmd);
  };

  const endConversation = () => {
    if (isLoading) return;
    sendMessage("[END]");
  };

  const resetConversation = () => {
    setSelectedScenario(null);
    setMessages([]);
    setInput("");
  };

  if (!selectedScenario) {
    return (
      <AppLayout>
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {language === "sv" ? "Konversationsövning" : "Conversation Practice"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "sv" ? "Öva vardagssamtal med en AI-partner" : "Practice everyday conversations with an AI partner"}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mb-4">
            {language === "sv" ? "Välj ett scenario för att börja:" : "Choose a scenario to begin:"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => startConversation(s)}
                className="bg-card rounded-lg p-5 shadow-soft hover:shadow-warm transition-all hover:-translate-y-1 text-left"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-heading font-bold text-foreground">
                  {language === "sv" ? s.titleSv : s.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === "sv" ? s.descSv : s.descEn}
                </p>
              </button>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in flex flex-col h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedScenario.icon}</span>
            <h2 className="font-heading font-bold text-foreground">
              {language === "sv" ? selectedScenario.titleSv : selectedScenario.titleEn}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetConversation}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {language === "sv" ? "Nytt" : "New"}
            </Button>
            <Button variant="destructive" size="sm" onClick={endConversation} disabled={isLoading || messages.length < 2}>
              <X className="h-4 w-4 mr-1" />
              {language === "sv" ? "Avsluta" : "End"}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Helper buttons */}
        <div className="flex gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => sendSpecial("[HINT]")} disabled={isLoading || messages.length === 0}>
            <Lightbulb className="h-4 w-4 mr-1" />
            {language === "sv" ? "Ledtråd" : "Hint"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => sendSpecial("[TRANSLATE]")} disabled={isLoading || messages.length === 0}>
            <Languages className="h-4 w-4 mr-1" />
            {language === "sv" ? "Översätt" : "Translate"}
          </Button>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === "sv" ? "Skriv på spanska..." : "Write in Spanish..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default ConversationPage;
