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
  accessibility: {
    sv: {
      title: "Tillgänglighet",
      body: "Vi strävar efter att göra Murciélingo tillgängligt för alla. Appen är designad med tydliga kontraster, responsiv layout och stöd för skärmläsare. Om du upplever tillgänglighetsproblem, kontakta oss gärna så åtgärdar vi det.",
    },
    en: {
      title: "Accessibility",
      body: "We strive to make Murciélingo accessible to everyone. The app is designed with clear contrasts, responsive layout and screen reader support. If you experience accessibility issues, please contact us and we'll address them.",
    },
  },
  support: {
    sv: {
      title: "Support / Hjälpcenter",
      body: "**Behöver du hjälp?**\nAnvänd kontaktformuläret för att nå oss.\n\n**Vanliga lösningar:**\n- **Inloggningsproblem:** Prova att återställa ditt lösenord via 'Glömt lösenord'.\n- **Appen laddar inte:** Rensa webbläsarens cache och försök igen.\n- **Framsteg saknas:** Se till att du är inloggad med rätt konto.\n- **Ljudproblem:** Kontrollera att din enhet inte är på tyst läge.",
    },
    en: {
      title: "Support / Help center",
      body: "**Need help?**\nUse the contact form to reach us.\n\n**Common solutions:**\n- **Login issues:** Try resetting your password via 'Forgot password'.\n- **App won't load:** Clear your browser cache and try again.\n- **Missing progress:** Make sure you're logged in with the correct account.\n- **Audio issues:** Check that your device is not on silent mode.",
    },
  },
  pricing: {
    sv: {
      title: "Priser / Planer",
      body: "**Gratis plan**\nAlla grundfunktioner är helt gratis – övningar, grammatik, ordbok, uttal och konversation.\n\n**Premium (kommer snart)**\nVi arbetar på avancerade funktioner som personliga studieplaner, offlineläge och utökade AI-konversationer. Håll utkik!",
    },
    en: {
      title: "Pricing / Plans",
      body: "**Free plan**\nAll core features are completely free – exercises, grammar, dictionary, pronunciation and conversation.\n\n**Premium (coming soon)**\nWe're working on advanced features like personalized study plans, offline mode and extended AI conversations. Stay tuned!",
    },
  },
  changelog: {
    sv: {
      title: "Nyheter",
      body: "**Mars 2026**\n- Murci-maskoten introducerad som lärpartner\n- Dubbelriktade översättningsövningar\n- Förbättrad ordbok med användningsexempel\n- Kontaktformulär och utökad footer\n\n**Februari 2026**\n- AI-konversationsövning lanserad\n- Uttalsövning med taligenkänning\n- Grammatiklektioner med interaktiva övningar\n- SRS-flashcards (smart repetition)",
    },
    en: {
      title: "What's new",
      body: "**March 2026**\n- Murci mascot introduced as learning partner\n- Bidirectional translation exercises\n- Improved dictionary with usage examples\n- Contact form and expanded footer\n\n**February 2026**\n- AI conversation practice launched\n- Pronunciation practice with speech recognition\n- Grammar lessons with interactive exercises\n- SRS flashcards (spaced repetition)",
    },
  },
  "delete-account": {
    sv: {
      title: "Radera konto / Dataförfrågan",
      body: "**Radera ditt konto**\nOm du vill radera ditt konto och all tillhörande data, kontakta oss via kontaktformuläret med ämnet 'Kontoproblem'. Vi behandlar din begäran inom 30 dagar.\n\n**Begär din data**\nEnligt GDPR har du rätt att begära en kopia av dina personuppgifter. Kontakta oss så skickar vi en export.\n\n**Vad raderas:**\n- Profil och inställningar\n- Övningsframsteg och statistik\n- Sparade ord i ordboken\n- Streaks och aktivitetslogg",
    },
    en: {
      title: "Delete account / Data request",
      body: "**Delete your account**\nIf you want to delete your account and all associated data, contact us via the contact form with the subject 'Account issue'. We'll process your request within 30 days.\n\n**Request your data**\nUnder GDPR you have the right to request a copy of your personal data. Contact us and we'll send you an export.\n\n**What gets deleted:**\n- Profile and settings\n- Exercise progress and statistics\n- Saved words in dictionary\n- Streaks and activity log",
    },
  },
  feedback: {
    sv: {
      title: "Feedback / Community",
      body: "**Vi vill höra från dig!**\nDin feedback hjälper oss att förbättra Murciélingo. Använd kontaktformuläret för att skicka förslag, rapportera buggar eller bara berätta vad du tycker.\n\n**Funktionsförslag**\nHar du en idé om en ny funktion? Skicka den till oss! Vi prioriterar förslag baserat på efterfrågan.\n\n**Communityn**\nVi bygger en gemenskap av språkelever. Mer information kommer snart!",
    },
    en: {
      title: "Feedback / Community",
      body: "**We want to hear from you!**\nYour feedback helps us improve Murciélingo. Use the contact form to send suggestions, report bugs, or just tell us what you think.\n\n**Feature requests**\nHave an idea for a new feature? Send it to us! We prioritize suggestions based on demand.\n\n**Community**\nWe're building a community of language learners. More info coming soon!",
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
