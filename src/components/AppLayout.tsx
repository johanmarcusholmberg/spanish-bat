import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import batAvatar from "@/assets/bat-avatar.png";
import { Home, BookOpen, User, LogOut } from "lucide-react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { to: "/dashboard", icon: Home, label: t("dashboard") },
    { to: "/exercises", icon: BookOpen, label: t("exercises") },
    { to: "/profile", icon: User, label: t("profile") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={batAvatar} alt="MurciélagoLingo" className="w-8 h-8" />
          <span className="font-heading font-bold text-foreground text-lg">MurciélagoLingo</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border px-4">
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
              {item.label}
              {item.to === "/profile" && user?.level && (
                <span className="text-xs font-bold bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">{user.level}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
