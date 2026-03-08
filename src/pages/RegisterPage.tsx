import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import batAvatar from "@/assets/bat-avatar.png";
import { Eye, EyeOff, Mail, ArrowLeft, Check, X } from "lucide-react";

const RegisterPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      setRegistered(true);
    }
  };

  const Requirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? <Check className="h-3.5 w-3.5 text-mint-dark" /> : <X className="h-3.5 w-3.5 text-destructive" />}
      <span className={met ? "text-mint-dark" : "text-muted-foreground"}>{text}</span>
    </div>
  );

  if (registered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <img src={batAvatar} alt="MurciélagoLingo" className="w-24 h-24 mx-auto mb-4 animate-float" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{t("verificationSent")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkEmail")}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition"
          >
            {t("backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToLogin")}
        </button>

        <div className="text-center mb-6">
          <img src={batAvatar} alt="MurciélagoLingo" className="w-20 h-20 mx-auto mb-3 animate-float" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("createAccount")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("registerInfo")}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("email")}</label>
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
              <label className="block text-sm font-medium text-foreground mb-1">{t("password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <Requirement met={hasMinLength} text={language === "sv" ? "Minst 8 tecken" : "At least 8 characters"} />
                <Requirement met={hasUppercase} text={language === "sv" ? "En stor bokstav" : "One uppercase letter"} />
                <Requirement met={hasNumber} text={language === "sv" ? "En siffra" : "One number"} />
                <Requirement met={hasSpecial} text={language === "sv" ? "Ett specialtecken" : "One special character"} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("confirmPassword")}</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                placeholder="••••••••"
                required
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-destructive text-sm mt-1">
                  {language === "sv" ? "Lösenorden matchar inte" : "Passwords don't match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("register")}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">{t("orLoginWith")}</span>
              </div>
            </div>
            <button className="mt-4 w-full py-2.5 rounded-md bg-background border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted transition">
              <Mail className="h-4 w-4" />
              {t("registerWithGoogle")}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("alreadyHaveAccount")}{" "}
            <button onClick={() => navigate("/")} className="text-peach-dark hover:underline font-medium">
              {t("login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
