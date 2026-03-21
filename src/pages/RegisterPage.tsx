import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import MurciMascot from "@/components/MurciMascot";
import { Eye, EyeOff, ArrowLeft, Check, X, Loader2 } from "lucide-react";

const RegisterPage = () => {
  const { t, language } = useLanguage();
  const { register: signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");
    const err = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
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
          <MurciMascot size="lg" mood="celebrating" message={language === "sv" ? "Välkommen ombord! 🎉" : "Welcome aboard! 🎉"} />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2 mt-4">{t("verificationSent")}</h1>
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
          <MurciMascot size="md" mood="happy" />
          <h1 className="text-2xl font-heading font-bold text-foreground mt-3">{t("createAccount")}</h1>
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

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
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
            <div className="mt-4 space-y-2">
              <button
                onClick={signInWithGoogle}
                className="w-full py-2.5 rounded-md bg-background border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t("registerWithGoogle")}
              </button>
              <button
                onClick={async () => {
                  const { lovable } = await import("@/integrations/lovable/index");
                  await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
                }}
                className="w-full py-2.5 rounded-md bg-background border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z" />
                </svg>
                {t("registerWithApple")}
              </button>
            </div>
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
