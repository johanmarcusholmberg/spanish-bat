import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import Footer from "@/components/Footer";
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";

const SUBJECTS = [
  { value: "bug", sv: "Buggrapport", en: "Bug report" },
  { value: "technical", sv: "Tekniskt problem", en: "Technical issue" },
  { value: "account", sv: "Kontoproblem", en: "Account issue" },
  { value: "feature", sv: "Funktionsförslag", en: "Feature request" },
  { value: "feedback", sv: "Feedback", en: "Feedback" },
  { value: "payment", sv: "Betalning", en: "Payment" },
  { value: "other", sv: "Övrigt", en: "Other" },
];

const MAX_MESSAGE = 1000;
const RATE_LIMIT_KEY = "contact_last_sent";
const RATE_LIMIT_MS = 60_000; // 1 min

const ContactPage = () => {
  const { t, language } = useLanguage();
  const { user, session, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [subject, setSubject] = useState(searchParams.get("subject") || "");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setEmail(user.email);
    }
  }, [isLoggedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message.trim() || !email.trim()) {
      toast({
        title: language === "sv" ? "Fyll i alla fält" : "Fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Rate limit
    const lastSent = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSent && Date.now() - Number(lastSent) < RATE_LIMIT_MS) {
      toast({
        title: language === "sv" ? "Vänta en minut innan du skickar igen" : "Please wait a minute before sending again",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages" as any).insert({
      subject,
      message: message.trim(),
      email: email.trim(),
      user_id: session?.user?.id || null,
    } as any);

    if (error) {
      setLoading(false);
      toast({ title: language === "sv" ? "Något gick fel" : "Something went wrong", variant: "destructive" });
      return;
    }

    // Notify app owner
    try {
      await supabase.functions.invoke("contact-notify", {
        body: {
          subject,
          message: message.trim(),
          email: email.trim(),
          user_id: session?.user?.id || null,
        },
      });
    } catch (notifyErr) {
      console.error("Notification failed:", notifyErr);
    }
    setLoading(false);

    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    setSent(true);
  };

  const content = (
    <div className="animate-fade-in max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "sv" ? "Tillbaka" : "Back"}
      </button>

      <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        {t("footerContact")}
      </h1>

      {sent ? (
        <div className="bg-card rounded-lg p-8 shadow-soft text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h2 className="text-xl font-heading font-bold text-foreground">
            {language === "sv" ? "Tack för ditt meddelande!" : "Thanks for contacting us!"}
          </h2>
          <p className="text-muted-foreground">
            {language === "sv" ? "Vi svarar så snart som möjligt." : "We'll reply as soon as possible."}
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
            className="px-6 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition"
          >
            {language === "sv" ? "Tillbaka till start" : "Back to home"}
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {language === "sv" ? "Ämne" : "Subject"} *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
              >
                <option value="">{language === "sv" ? "Välj ämne..." : "Select subject..."}</option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {language === "sv" ? s.sv : s.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("email")} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {language === "sv" ? "Meddelande" : "Message"} *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                rows={5}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                placeholder={language === "sv" ? "Beskriv ditt ärende..." : "Describe your issue..."}
                required
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {message.length}/{MAX_MESSAGE}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {language === "sv" ? "Skicka" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  if (isLoggedIn) {
    return (
      <AppLayout>
        {content}
        <Footer />
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {content}
      <Footer />
    </div>
  );
};

export default ContactPage;
