import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageToggle from "@/components/LanguageToggle";
import batAvatar from "@/assets/bat-avatar.png";
import { Eye, EyeOff, Mail } from "lucide-react";

const LoginPage = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("language") === "sv" ? "Fyll i alla fält" : "Fill in all fields");
      return;
    }
    const success = login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Avatar & Title */}
        <div className="text-center mb-8">
          <img
            src={batAvatar}
            alt="MurciélagoLingo mascot"
            className="w-28 h-28 mx-auto mb-4 animate-float"
          />
          <p className="text-muted-foreground text-sm mb-1">{t("welcome")}</p>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {t("appName")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("appTagline")}</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("username")} / {t("email")}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                placeholder={t("username") + " / email@example.com"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                {t("showPassword")}
              </label>
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition"
            >
              {t("login")}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => navigate("/register")}
              className="w-full py-2.5 rounded-md bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition"
            >
              {t("register")}
            </button>

            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition underline"
            >
              {t("forgotPassword")}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">{t("orLoginWith")}</span>
              </div>
            </div>

            <button
              className="mt-4 w-full py-2.5 rounded-md bg-background border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted transition"
            >
              <Mail className="h-4 w-4" />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
