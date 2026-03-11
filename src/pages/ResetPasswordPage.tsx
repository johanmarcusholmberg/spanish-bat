import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import batAvatar from "@/assets/bat-avatar.png";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";

const ResetPasswordPage = () => {
  const { t, language } = useLanguage();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");
    const err = await updatePassword(password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
  };

  const Requirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? <Check className="h-3.5 w-3.5 text-mint-dark" /> : <X className="h-3.5 w-3.5 text-destructive" />}
      <span className={met ? "text-mint-dark" : "text-muted-foreground"}>{text}</span>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <img src={batAvatar} alt="Murciélingo" className="w-24 h-24 mx-auto mb-4 animate-float" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {language === "sv" ? "Lösenord återställt!" : "Password reset!"}
          </h1>
          <p className="text-muted-foreground">
            {language === "sv" ? "Du omdirigeras till inloggningen..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={batAvatar} alt="Murciélingo" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("resetPasswordTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("passwordHistory")}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("newPassword")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition pr-10"
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
              <label className="block text-sm font-medium text-foreground mb-1">{t("confirmNewPassword")}</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("resetPassword")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
