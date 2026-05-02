import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/murcielago-logo.png";

const LOGIN_ROUTE = "/login";
const REGISTER_ROUTE = "/register";

const loopSteps = [
  { label: "Hear it", desc: "Meet useful Spanish in small pieces." },
  { label: "Repeat it", desc: "Echo sounds, words, and phrases." },
  { label: "Build it", desc: "Create sentences step by step." },
  { label: "Use it", desc: "Practice in context through reading and conversation." },
  { label: "Remember it", desc: "Recall language until it starts to come back naturally." },
];

const previewCards = [
  { key: "A", title: "Echo Practice" },
  { key: "B", title: "Sentence Builder" },
  { key: "C", title: "Conversation Practice" },
  { key: "D", title: "Daily Practice" },
];

const practiceModes = [
  { name: "Echo Practice", desc: "Listen, repeat, and recall Spanish until it starts to stick." },
  { name: "Sentence Builder", desc: "Build useful sentences step by step." },
  { name: "Flashcards", desc: "Meet important words again at the right moment." },
  { name: "Vocabulary", desc: "Practice words in context, not just as lists." },
  { name: "Grammar", desc: "Understand patterns through simple examples." },
  { name: "Reading", desc: "Read short Spanish texts with support." },
  { name: "Conversation", desc: "Practice everyday Spanish in small dialogues." },
  { name: "Pronunciation", desc: "Train sounds, rhythm, and confidence." },
];

const trustStatements = [
  "Built for short daily practice",
  "Designed for beginners and returning learners",
  "Practice reading, speaking, listening, and recall",
  "A softer way to build Spanish confidence",
];

const HomePage = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && isLoggedIn) navigate("/dashboard", { replace: true });
  }, [isLoggedIn, loading, navigate]);

  const handlePreviewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("app-preview");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img src={logo} alt="Murcielingo" className="h-8 w-8" />
          <span>Murcielingo</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <a href="#app-preview" onClick={handlePreviewClick}>Preview</a>
          <a href="#learning-loop">How it works</a>
          <a href="#practice-modes">Practice</a>
          <a href="#mobile-app">Mobile app</a>
        </nav>
        <div className="flex gap-2">
          <Link to={LOGIN_ROUTE}>Log in</Link>
          <Link to={REGISTER_ROUTE}>Start learning</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="p-6">
        <h1>Echo the language</h1>
        <p>Spanish practice that comes back to you.</p>
        <p>
          Learn Spanish through short, varied practice that helps words, sounds,
          and sentence patterns come back naturally.
        </p>
        <div className="flex gap-2">
          <Link to={REGISTER_ROUTE}>Start learning</Link>
          <a href="#app-preview" onClick={handlePreviewClick}>Preview the app</a>
        </div>
        {/* Hero preview mockup — Phase 2 */}
        <div data-placeholder="hero-preview" />
      </section>

      {/* Learning loop */}
      <section id="learning-loop" className="p-6">
        <h2>Spanish starts to stick when you meet it more than once.</h2>
        <ol className="flex flex-col md:flex-row gap-4">
          {loopSteps.map((step) => (
            <li key={step.label}>
              <h3>{step.label}</h3>
              <p>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* App preview */}
      <section id="app-preview" className="p-6">
        <h2>See what practice feels like</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewCards.map((card) => (
            <div key={card.key}>
              {/* App preview card — Phase 2 */}
              <p>{card.key}. {card.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Practice variety */}
      <section className="p-6">
        <h2>Practice should not feel like a checklist.</h2>
        <p>
          Murcielingo gives you different ways to meet the same language again:
          listen, repeat, choose, build, read, speak, and recall. So when one
          practice is done, another useful way to keep learning can begin.
        </p>
      </section>

      {/* Practice modes */}
      <section id="practice-modes" className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {practiceModes.map((mode) => (
            <div key={mode.name}>
              <h3>{mode.name}</h3>
              <p>{mode.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile app */}
      <section id="mobile-app" className="p-6">
        <h2>Practice anywhere</h2>
        <p>
          Murcielingo is being prepared for mobile, so your Spanish practice can
          follow you through the day.
        </p>
        <div className="flex gap-2">
          <button type="button" disabled>App Store (coming soon)</button>
          <button type="button" disabled>Google Play (coming soon)</button>
        </div>
      </section>

      {/* Trust */}
      <section className="p-6">
        <ul>
          {trustStatements.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="p-6">
        <h2>Ready to let Spanish echo back?</h2>
        <p>Start with a few minutes of practice and build from there.</p>
        <div className="flex gap-2">
          <Link to={REGISTER_ROUTE}>Start learning</Link>
          <Link to={LOGIN_ROUTE}>Log in</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 border-t">
        <p><strong>Murcielingo</strong></p>
        <p>Echo the language</p>
        <div className="flex gap-4">
          <Link to={LOGIN_ROUTE}>Log in</Link>
          <Link to={REGISTER_ROUTE}>Start learning</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <p>© {new Date().getFullYear()} Murcielingo</p>
      </footer>
    </div>
  );
};

export default HomePage;
