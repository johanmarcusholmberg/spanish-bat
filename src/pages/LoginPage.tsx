import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageToggle from "@/components/LanguageToggle";
import batAvatar from "@/assets/bat-avatar.png";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LoginPage = () => {
  const { t, setLanguage } = useLanguage();
  const { login, signInWithGoogle, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) navigate("/dashboard");
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("language") === "sv" ? "Fyll i alla fält" : "Fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md" style={{ animation: 'fade-in 0.5s ease-out both' }}>
        <div className="text-center mb-8">
          <img src={batAvatar} alt="Murciélingo mascot" className="w-28 h-28 mx-auto mb-4 animate-float" />
          <p className="text-muted-foreground text-sm mb-1">{t("welcome")}</p>
          <h1 className="text-3xl font-heading font-bold text-foreground">{t("appName")}</h1>
          <p className="text-muted-foreground mt-1">{t("appTagline")}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("password")}</label>
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
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
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
              onClick={handleGoogle}
              disabled={loading}
              className="mt-4 w-full py-2.5 rounded-md bg-background border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted transition disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
