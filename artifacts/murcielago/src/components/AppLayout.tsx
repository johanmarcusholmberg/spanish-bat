import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";
import LanguageToggle from "@/components/LanguageToggle";
import logo from "@/assets/murcielago-logo.png";
import { Sun, Moon, LogOut, Shield, User } from "lucide-react";
import {
  EchoRingsMotif,
  WaveformMotif,
  PhraseBubbleMotif,
  PathDotsMotif,
} from "@/components/EchoMotifs";
import type { LanguageCode } from "@/i18n/languages";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLanguage();
  const { user, logout, isAdmin, updateProfile } = useAuth();

  const handleLanguageChange = (code: LanguageCode) => {
    if (user && user.learningFrom !== code) {
      // Persist the choice to the user's profile so it survives across devices.
      void updateProfile({ learningFrom: code }).catch(() => {
        // Optimistic update is already applied; ignore network failure.
      });
    }
  };
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Learner navigation only — Admin is intentionally NOT here so the
  // primary nav stays focused on the daily learning ritual. Admin has
  // its own header pill (admin-role-gated) and its own route guard.
  //
  // TODO: Re-enable authenticator/2FA for admin before production.
  const navItems = [
    { to: "/dashboard", motif: EchoRingsMotif, label: t("navToday") },
    { to: "/practice", motif: WaveformMotif, label: t("navPractice") },
    { to: "/library", motif: PhraseBubbleMotif, label: t("navLibrary") },
    { to: "/stats", motif: PathDotsMotif, label: t("navProgress") },
    { to: "/profile", motif: null as null | typeof EchoRingsMotif, label: t("profile") },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Murciélingo Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,181,167,0.6)]" />
          <span className="font-heading font-bold text-foreground text-lg tracking-tight">Murciélingo</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin entry — discreet icon-only control gated by role.
              Visually muted so it never competes with the daily learner
              experience; the label is reserved for screen readers and
              the hover tooltip. Hidden entirely from non-admin users.
              TODO: Re-enable authenticator/2FA for admin before production. */}
          {isAdmin && (
            <NavLink
              to="/admin"
              title={t("adminPanel")}
              aria-label={t("adminPanel")}
              className={({ isActive }) =>
                `inline-flex items-center justify-center h-8 w-8 rounded-md transition ${
                  isActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Shield className="h-4 w-4" />
              <span className="sr-only">{t("adminPanel")}</span>
            </NavLink>
          )}
          <LanguageToggle variant="globe" onChange={handleLanguageChange} />
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition text-sm px-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </header>

      {/* Desktop Navigation — learner-only, no admin tile competing here. */}
      <nav className="hidden md:block bg-card border-b border-border px-4">
        <div className="max-w-4xl mx-auto flex gap-1">
          {navItems.map((item) => {
            const Motif = item.motif;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  }`
                }
              >
                {Motif ? (
                  <Motif className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {item.to === "/profile" && user?.level
                  ? `${item.label} · ${user.level}`
                  : item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {children}
      </main>

      <Footer />

      {/* Mobile Bottom Navigation — learner-only, larger tap targets. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border px-1.5 py-1 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Motif = item.motif;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] text-[10px] font-medium transition rounded-lg ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`
                }
              >
                {Motif ? (
                  <Motif className="h-6 w-6" />
                ) : (
                  <User className="h-6 w-6" />
                )}
                <span>{item.to === "/profile" && user?.level ? user.level : item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
