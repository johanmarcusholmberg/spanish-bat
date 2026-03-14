import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const pages: Record<string, { sv: { title: string; body: string }; en: { title: string; body: string } }> = {
  about: {
    sv: {
      title: "Om oss",
      body: "Murciélingo är en interaktiv plattform för att lära sig spanska. Vår maskot Murci, den vänliga fladdermusen, guidar dig genom din språkresa med övningar, konversation, grammatik och uttal. Oavsett om du är nybörjare eller avancerad – vi har något för dig!",
    },
    en: {
      title: "About us",
      body: "Murciélingo is an interactive platform for learning Spanish. Our mascot Murci, the friendly bat, guides you through your language journey with exercises, conversation, grammar and pronunciation. Whether you're a beginner or advanced – we have something for you!",
    },
  },
  faq: {
    sv: {
      title: "Vanliga frågor",
      body: "**Är Murciélingo gratis?**\nJa, grundfunktionerna är helt gratis.\n\n**Behöver jag ett konto?**\nJa, skapa ett konto för att spara dina framsteg.\n\n**Vilka nivåer finns?**\nVi stödjer A1 till C2 enligt den europeiska referensramen.\n\n**Kan jag använda appen på mobilen?**\nAbsolut! Appen är fullt responsiv.\n\n**Hur kontaktar jag support?**\nAnvänd kontaktformuläret under 'Kontakta oss'.",
    },
    en: {
      title: "FAQ",
      body: "**Is Murciélingo free?**\nYes, the core features are completely free.\n\n**Do I need an account?**\nYes, create an account to save your progress.\n\n**What levels are available?**\nWe support A1 to C2 following the European framework.\n\n**Can I use the app on mobile?**\nAbsolutely! The app is fully responsive.\n\n**How do I contact support?**\nUse the contact form under 'Contact us'.",
    },
  },
  "how-it-works": {
    sv: {
      title: "Hur det fungerar",
      body: "1. **Skapa ett konto** – Registrera dig gratis och välj din nivå.\n2. **Välj övningar** – Verb, substantiv, grammatik, läsförståelse och mer.\n3. **Öva dagligen** – Bygg en streak och följ dina framsteg.\n4. **Spara ord** – Lägg till ord i din personliga ordbok.\n5. **Avancera** – Lås upp nya nivåer när du blir bättre!",
    },
    en: {
      title: "How it works",
      body: "1. **Create an account** – Sign up for free and choose your level.\n2. **Choose exercises** – Verbs, nouns, grammar, reading and more.\n3. **Practice daily** – Build a streak and track your progress.\n4. **Save words** – Add words to your personal dictionary.\n5. **Advance** – Unlock new levels as you improve!",
    },
  },
  privacy: {
    sv: {
      title: "Integritetspolicy",
      body: "Vi värnar om din integritet. Vi samlar in e-post, visningsnamn och övningsdata för att ge dig en bra upplevelse. Vi delar aldrig dina personuppgifter med tredje part utan ditt samtycke. Du kan radera ditt konto när som helst genom att kontakta oss.",
    },
    en: {
      title: "Privacy Policy",
      body: "We value your privacy. We collect email, display name, and exercise data to provide a great experience. We never share your personal information with third parties without your consent. You can delete your account at any time by contacting us.",
    },
  },
  terms: {
    sv: {
      title: "Användarvillkor",
      body: "Genom att använda Murciélingo godkänner du dessa villkor. Tjänsten tillhandahålls i befintligt skick. Vi förbehåller oss rätten att ändra eller avsluta tjänsten. Användare förväntas använda tjänsten på ett ansvarsfullt sätt.",
    },
    en: {
      title: "Terms of Service",
      body: "By using Murciélingo you agree to these terms. The service is provided as-is. We reserve the right to modify or discontinue the service. Users are expected to use the service responsibly.",
    },
  },
  cookies: {
    sv: {
      title: "Cookiepolicy",
      body: "Vi använder cookies för att hålla dig inloggad och spara dina preferenser (som mörkt läge och språkval). Vi använder inga spårningscookies eller tredjepartscookies för marknadsföring.",
    },
    en: {
      title: "Cookie Policy",
      body: "We use cookies to keep you logged in and save your preferences (like dark mode and language). We do not use tracking cookies or third-party cookies for marketing.",
    },
  },
};

const StaticPage = () => {
  const location = useLocation();
  const page = location.pathname.replace("/", "");
  const { language } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const data = pages[page || ""] ?? pages["about"];
  const content = data[language];

  const body = (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "sv" ? "Tillbaka" : "Back"}
      </button>

      <h1 className="text-2xl font-heading font-bold text-foreground mb-4">{content.title}</h1>
      <div className="bg-card rounded-lg p-6 shadow-soft prose prose-sm max-w-none">
        {content.body.split("\n").map((line, i) => {
          const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          return <p key={i} className="text-foreground mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
        })}
      </div>
      <Footer />
    </div>
  );

  if (isLoggedIn) {
    return <AppLayout>{body}</AppLayout>;
  }

  return <div className="min-h-screen bg-background p-4">{body}</div>;
};

export default StaticPage;
