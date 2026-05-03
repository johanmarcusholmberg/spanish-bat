import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  Mic,
  Sparkles,
  ArrowRight,
  Headphones,
  Repeat,
  Blocks,
  MessageCircle,
  Brain,
  BookOpen,
  Layers,
  GraduationCap,
  ScrollText,
  Heart,
  Apple,
  Play,
  Check,
  Flame,
} from "lucide-react";
import logo from "@/assets/murcielago-logo.png";
import LanguageToggle from "@/components/LanguageToggle";

const LOGIN_ROUTE = "/login";
const REGISTER_ROUTE = "/register";

const HomePage = () => {
  const { isLoggedIn, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && isLoggedIn) navigate("/dashboard", { replace: true });
  }, [isLoggedIn, loading, navigate]);

  const handlePreviewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("app-preview");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const loopSteps = [
    { Icon: Headphones, label: t("homeLoopHearLabel"), desc: t("homeLoopHearDesc") },
    { Icon: Repeat, label: t("homeLoopRepeatLabel"), desc: t("homeLoopRepeatDesc") },
    { Icon: Blocks, label: t("homeLoopBuildLabel"), desc: t("homeLoopBuildDesc") },
    { Icon: MessageCircle, label: t("homeLoopUseLabel"), desc: t("homeLoopUseDesc") },
    { Icon: Brain, label: t("homeLoopRememberLabel"), desc: t("homeLoopRememberDesc") },
  ];

  const practiceModes = [
    { Icon: Volume2, name: t("homeModeEchoName"), desc: t("homeModeEchoDesc") },
    { Icon: Blocks, name: t("homeModeSentenceName"), desc: t("homeModeSentenceDesc") },
    { Icon: Layers, name: t("homeModeFlashName"), desc: t("homeModeFlashDesc") },
    { Icon: BookOpen, name: t("homeModeVocabName"), desc: t("homeModeVocabDesc") },
    { Icon: GraduationCap, name: t("homeModeGrammarName"), desc: t("homeModeGrammarDesc") },
    { Icon: ScrollText, name: t("homeModeReadingName"), desc: t("homeModeReadingDesc") },
    { Icon: MessageCircle, name: t("homeModeConvName"), desc: t("homeModeConvDesc") },
    { Icon: Mic, name: t("homeModePronName"), desc: t("homeModePronDesc") },
  ];

  const trustStatements = [
    { Icon: Heart, text: t("homeTrustDaily") },
    { Icon: Sparkles, text: t("homeTrustBeginners") },
    { Icon: BookOpen, text: t("homeTrustSkills") },
    { Icon: GraduationCap, text: t("homeTrustConfidence") },
  ];

  const HeroPreviewCard = () => (
    <Card className="bg-sand border-peach/30 shadow-xl rounded-3xl overflow-hidden max-w-md w-full">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Badge className="bg-peach/30 text-peach-dark hover:bg-peach/30 border-0 rounded-full px-3 py-1">
            {t("homeHeroPreviewBadge")}
          </Badge>
          <span className="text-xs text-muted-foreground font-body">{t("homeHeroPreviewLesson")}</span>
        </div>
        <div className="bg-background/60 rounded-2xl p-5 text-center">
          <p className="text-xs text-muted-foreground mb-2 font-body">{t("homeHeroPreviewListenAndRepeat")}</p>
          <p className="font-heading text-2xl md:text-3xl text-foreground">¿Cómo te llamas?</p>
          <p className="text-sm text-muted-foreground mt-2 font-body">{t("homeHeroPreviewPhraseTranslation")}</p>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1 bg-peach hover:bg-peach-dark text-primary-foreground rounded-full font-body">
            <Volume2 className="w-4 h-4 mr-2" /> {t("homeHeroPreviewListen")}
          </Button>
          <Button variant="outline" className="flex-1 border-peach text-peach-dark hover:bg-peach/10 rounded-full font-body">
            <Mic className="w-4 h-4 mr-2" /> {t("homeHeroPreviewRepeat")}
          </Button>
        </div>
        <div>
          <div className="h-2 rounded-full bg-mint/30 overflow-hidden">
            <div className="h-full w-2/3 bg-mint-dark rounded-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-body">{t("homeHeroPreviewProgress")}</p>
        </div>
      </CardContent>
    </Card>
  );

  const EchoPracticeCard = () => (
    <Card className="bg-sand border-peach/20 rounded-3xl shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        <Badge className="bg-peach/30 text-peach-dark hover:bg-peach/30 border-0 rounded-full">{t("homePreviewListen")}</Badge>
        <div className="bg-background/60 rounded-2xl p-4 text-center">
          <p className="font-heading text-2xl text-foreground">Buenos días</p>
          <p className="text-sm text-muted-foreground mt-1 font-body">{t("homePreviewGoodMorning")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-peach hover:bg-peach-dark text-primary-foreground rounded-full font-body">
            <Volume2 className="w-4 h-4 mr-1" /> {t("homeHeroPreviewListen")}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-peach text-peach-dark hover:bg-peach/10 rounded-full font-body">
            <Mic className="w-4 h-4 mr-1" /> {t("homeHeroPreviewRepeat")}
          </Button>
        </div>
        <div className="h-1.5 rounded-full bg-mint/30 overflow-hidden">
          <div className="h-full w-1/2 bg-mint-dark rounded-full" />
        </div>
      </CardContent>
    </Card>
  );

  const SentenceBuilderCard = () => {
    const tiles = ["Yo", "quiero", "aprender", "español"];
    return (
      <Card className="bg-sand border-peach/20 rounded-3xl shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 space-y-4">
          <Badge className="bg-mint/40 text-foreground hover:bg-mint/40 border-0 rounded-full">{t("homePreviewBuild")}</Badge>
          <div className="bg-background/60 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-3 font-body">{t("homePreviewArrange")}</p>
            <div className="flex flex-wrap gap-2">
              {tiles.map((tile) => (
                <span
                  key={tile}
                  className="px-3 py-1.5 rounded-xl bg-peach/20 border border-peach/40 text-foreground font-body text-sm"
                >
                  {tile}
                </span>
              ))}
            </div>
          </div>
          <Button size="sm" className="w-full bg-peach hover:bg-peach-dark text-primary-foreground rounded-full font-body">
            <Check className="w-4 h-4 mr-2" /> {t("homePreviewConfirm")}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const ConversationCard = () => (
    <Card className="bg-sand border-peach/20 rounded-3xl shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        <Badge className="bg-mint/40 text-foreground hover:bg-mint/40 border-0 rounded-full">{t("homePreviewConversation")}</Badge>
        <div className="space-y-2">
          <div className="bg-background/60 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
            <p className="font-body text-sm text-foreground">— Hola, ¿qué tal?</p>
          </div>
          <div className="bg-peach/20 rounded-2xl rounded-tr-sm p-3 max-w-[85%] ml-auto">
            <p className="font-body text-sm text-foreground">— Muy bien, ¿y tú?</p>
          </div>
        </div>
        <div className="border border-dashed border-peach/40 rounded-2xl p-3 text-center">
          <p className="text-sm text-muted-foreground font-body">{t("homePreviewYourReply")}</p>
        </div>
      </CardContent>
    </Card>
  );

  const DailyPracticeCard = () => (
    <Card className="bg-sand border-peach/20 rounded-3xl shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        <Badge className="bg-mint/40 text-foreground hover:bg-mint/40 border-0 rounded-full">{t("homePreviewRemember")}</Badge>
        <div className="bg-background/60 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-mint/30 flex items-center justify-center">
            <Flame className="w-6 h-6 text-peach-dark" />
          </div>
          <div>
            <p className="font-heading text-lg text-foreground">{t("homePreviewPracticeToday")}</p>
            <p className="text-sm text-muted-foreground font-body">{t("homePreviewFewMinutes")}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="w-full border-mint-dark text-foreground hover:bg-mint/20 rounded-full font-body">
          {t("homePreviewKeepGoing")}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-sand text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Murcielingo" className="h-9 w-9" />
            <span className="font-heading font-bold text-xl text-foreground hidden xs:inline sm:inline">Murcielingo</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 font-body text-foreground/80">
            <a href="#app-preview" onClick={handlePreviewClick} className="hover:text-peach-dark transition-colors">{t("homeNavPreview")}</a>
            <a href="#learning-loop" className="hover:text-peach-dark transition-colors">{t("homeNavHowItWorks")}</a>
            <a href="#practice-modes" className="hover:text-peach-dark transition-colors">{t("homeNavPractice")}</a>
            <a href="#mobile-app" className="hover:text-peach-dark transition-colors">{t("homeNavMobile")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle
              variant="globe"
              className="mr-1 hover:bg-peach/15"
              codeClassName="hidden sm:inline"
            />
            <Button asChild variant="outline" className="rounded-full border-peach text-peach-dark hover:bg-peach/10 font-body">
              <Link to={LOGIN_ROUTE}>{t("homeCtaLogin")}</Link>
            </Button>
            <Button asChild className="rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-body hidden sm:inline-flex">
              <Link to={REGISTER_ROUTE}>{t("homeCtaStart")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight">
              {t("homeHeroHeadline")}
            </h1>
            <p className="font-heading text-xl md:text-2xl text-foreground/80">
              {t("homeHeroSubhead")}
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
              {t("homeHeroBody")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <Button asChild size="lg" className="rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-body text-base px-8">
                <Link to={REGISTER_ROUTE}>
                  {t("homeCtaStart")} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-peach text-peach-dark hover:bg-peach/10 font-body text-base px-8">
                <a href="#app-preview" onClick={handlePreviewClick}>{t("homeCtaPreview")}</a>
              </Button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Learning loop */}
      <section id="learning-loop" className="bg-background/40 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center text-foreground max-w-3xl mx-auto leading-snug">
            {t("homeLoopHeadline")}
          </h2>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2 items-stretch">
            {loopSteps.map((step, i) => (
              <li key={step.label} className="relative flex flex-col items-center text-center">
                <Card className="bg-sand border-peach/20 rounded-3xl shadow-sm w-full h-full">
                  <CardContent className="p-5 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-peach/20 flex items-center justify-center">
                      <step.Icon className="w-6 h-6 text-peach-dark" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground">{step.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
                {i < loopSteps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 text-mint-dark/70" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* App preview */}
      <section id="app-preview" className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge className="bg-peach/30 text-peach-dark hover:bg-peach/30 border-0 rounded-full">{t("homePreviewBadge")}</Badge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
              {t("homePreviewHeadline")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <EchoPracticeCard />
            <SentenceBuilderCard />
            <ConversationCard />
            <DailyPracticeCard />
          </div>
        </div>
      </section>

      {/* Practice variety */}
      <section className="bg-background/40 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground leading-snug">
            {t("homeVarietyHeadline")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("homeVarietyBody")}
          </p>
        </div>
      </section>

      {/* Practice modes */}
      <section id="practice-modes" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {practiceModes.map((mode) => (
              <Card key={mode.name} className="bg-sand border-peach/20 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-peach/20 flex items-center justify-center">
                    <mode.Icon className="w-5 h-5 text-peach-dark" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{mode.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mode.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile app */}
      <section id="mobile-app" className="bg-background/40 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left space-y-5">
            <Badge className="bg-mint/40 text-foreground hover:bg-mint/40 border-0 rounded-full">{t("homeMobileBadge")}</Badge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
              {t("homeMobileHeadline")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
              {t("homeMobileBody")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button disabled className="rounded-full bg-foreground/80 text-background hover:bg-foreground/80 font-body opacity-70 cursor-not-allowed h-14 px-6 justify-start">
                <Apple className="w-6 h-6 mr-3" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wide opacity-80">{t("homeMobileComingSoon")}</div>
                  <div className="font-heading text-base">App Store</div>
                </div>
              </Button>
              <Button disabled className="rounded-full bg-foreground/80 text-background hover:bg-foreground/80 font-body opacity-70 cursor-not-allowed h-14 px-6 justify-start">
                <Play className="w-6 h-6 mr-3" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wide opacity-80">{t("homeMobileComingSoon")}</div>
                  <div className="font-heading text-base">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Card className="bg-sand border-peach/30 rounded-[2.5rem] shadow-xl w-64 p-3">
              <CardContent className="bg-background/60 rounded-[2rem] p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge className="bg-peach/30 text-peach-dark hover:bg-peach/30 border-0 rounded-full text-xs">{t("homeMobileToday")}</Badge>
                  <Flame className="w-4 h-4 text-peach-dark" />
                </div>
                <p className="font-heading text-xl text-foreground text-center">Hola 👋</p>
                <div className="bg-sand/70 rounded-2xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("homeMobilePracticePhrase")}</p>
                  <p className="font-heading text-lg text-foreground mt-1">Me gusta el café</p>
                </div>
                <Button size="sm" className="w-full bg-peach hover:bg-peach-dark text-primary-foreground rounded-full font-body">
                  {t("homeMobileStart")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustStatements.map((s) => (
              <Card key={s.text} className="bg-sand border-peach/20 rounded-3xl shadow-sm">
                <CardContent className="p-6 space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-mint/30 flex items-center justify-center mx-auto">
                    <s.Icon className="w-5 h-5 text-peach-dark" />
                  </div>
                  <p className="font-body text-foreground leading-relaxed">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="bg-peach/20 border-peach/40 rounded-[2rem] shadow-md">
            <CardContent className="p-10 md:p-14 text-center space-y-6">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
                {t("homeFinalHeadline")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {t("homeFinalBody")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg" className="rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-body text-base px-8">
                  <Link to={REGISTER_ROUTE}>
                    {t("homeCtaStart")} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-peach text-peach-dark hover:bg-peach/10 font-body text-base px-8">
                  <Link to={LOGIN_ROUTE}>{t("homeCtaLogin")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/40 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Murcielingo" className="h-8 w-8" />
              <span className="font-heading font-bold text-lg text-foreground">Murcielingo</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("appTagline")}</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-3">
            <div className="flex gap-5 font-body text-sm">
              <Link to={LOGIN_ROUTE} className="text-foreground/80 hover:text-peach-dark transition-colors">{t("homeCtaLogin")}</Link>
              <Link to={REGISTER_ROUTE} className="text-foreground/80 hover:text-peach-dark transition-colors">{t("homeCtaStart")}</Link>
              <Link to="/contact" className="text-foreground/80 hover:text-peach-dark transition-colors">{t("homeFooterContact")}</Link>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Murcielingo</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
