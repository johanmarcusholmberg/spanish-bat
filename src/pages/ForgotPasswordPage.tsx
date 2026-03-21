import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import MurciMascot from "@/components/MurciMascot";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

const ForgotPasswordPage = () => {
  const { t, language } = useLanguage();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: language === "sv" ? "Ange din e-postadress" : "Enter your email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    const err = await resetPassword(email);
    setLoading(false);
    if (err) {
      toast({ title: err, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <MurciMascot size="lg" mood="encouraging" message={language === "sv" ? "Kolla din inkorg! 📬" : "Check your inbox! 📬"} />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2 mt-4">{t("resetSent")}</h1>
          <p className="text-muted-foreground mb-6">{t("resetSentInfo")}</p>
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
          <MurciMascot size="md" mood="thinking" />
          <h1 className="text-2xl font-heading font-bold text-foreground mt-3">{t("forgotPasswordTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("forgotPasswordInfo")}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("sendResetLink")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
