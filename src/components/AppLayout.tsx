import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import batAvatar from "@/assets/bat-avatar.png";
import { Home, BookOpen, User, LogOut, BarChart3, Moon, Sun, Shield } from "lucide-react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
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

  const navItems = [
    { to: "/dashboard", icon: Home, label: t("dashboard") },
    { to: "/exercises", icon: BookOpen, label: t("exercises") },
    { to: "/stats", icon: BarChart3, label: t("statistics") },
    { to: "/profile", icon: User, label: t("profile") },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: t("adminPanel") }] : []),
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={batAvatar} alt="MurciélagoLingo" className="w-8 h-8" />
          <span className="font-heading font-bold text-foreground text-lg">MurciélagoLingo</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-card border-b border-border px-4">
        <div className="max-w-4xl mx-auto flex gap-1">
          {navItems.map((item) => (
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
              <item.icon className="h-4 w-4" />
              {item.to === "/profile" && user?.level
                ? `${item.label} – ${t("levelLabel")}: ${user.level}`
                : item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-1 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition rounded-lg ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.to === "/profile" && user?.level ? user.level : item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
