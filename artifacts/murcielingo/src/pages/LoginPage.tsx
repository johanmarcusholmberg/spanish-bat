import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Lock, Mail, KeyRound } from "lucide-react";
import logo from "@/assets/murcielingo-logo.png";
import LanguageToggle from "@/components/LanguageToggle";

type Mode =
  | "password"
  | "code"
  | "code-pending"
  | "mfa-pending"
  | "totp-pending"
  | "backup-code"
  | "reset-request"
  | "reset-verify";

const LoginPage = () => {
  const { t } = useLanguage();
  const interp = (key: string, params: Record<string, string>) =>
    Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), t(key));
  const {
    loginWithPassword,
    verifySecondFactorCode,
    verifyTotpSecondFactor,
    verifyBackupCodeSecondFactor,
    sendLoginCode,
    resendLoginCode,
    verifyLoginCode,
    sendResetPasswordCode,
    verifyResetPasswordCode,
    signInWithGoogle,
    signInWithApple,
    isLoggedIn,
  } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  React.useEffect(() => {
    if (isLoggedIn) navigate("/dashboard");
  }, [isLoggedIn, navigate]);

  const errToast = (msg: string) => toast({ title: msg, variant: "soft" });
  const okToast = (msg: string) => toast({ title: msg });

  // Password sign-in (primary)
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      errToast(t("loginInvalidEmail"));
      return;
    }
    if (!password) {
      errToast(t("loginEnterPassword"));
      return;
    }
    setLoading(true);
    const result = await loginWithPassword(email.trim(), password);
    setLoading(false);
    if (result.error) {
      errToast(result.error);
      return;
    }
    if (result.needsSecondFactor) {
      setCode("");
      if (result.needsTotp) {
        setMode("totp-pending");
        okToast(t("loginOpenAuthenticator"));
      } else {
        setMode("mfa-pending");
        okToast(t("loginCodeSentEmail"));
      }
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      errToast(t("loginEnterCode"));
      return;
    }
    setLoading(true);
    const err = await verifySecondFactorCode(code.trim());
    setLoading(false);
    if (err) errToast(err);
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const err =
      mode === "backup-code"
        ? await verifyBackupCodeSecondFactor(code.trim())
        : await verifyTotpSecondFactor(code.trim());
    setLoading(false);
    if (err) errToast(err);
  };

  // Email-code sign-in (fallback)
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      errToast(t("loginInvalidEmail"));
      return;
    }
    setLoading(true);
    const err = await sendLoginCode(email.trim());
    setLoading(false);
    if (err) {
      errToast(err);
      return;
    }
    setMode("code-pending");
    setCode("");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      errToast(t("loginEnterCode"));
      return;
    }
    setLoading(true);
    const err = await verifyLoginCode(code.trim());
    setLoading(false);
    if (err) errToast(err);
  };

  const handleResend = async () => {
    setResending(true);
    const err = await resendLoginCode();
    setResending(false);
    if (err) errToast(err);
    else okToast(t("loginNewCodeOnWay"));
  };

  // Forgot password
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      errToast(t("loginInvalidEmail"));
      return;
    }
    setLoading(true);
    const err = await sendResetPasswordCode(email.trim());
    setLoading(false);
    if (err) {
      errToast(err);
      return;
    }
    setMode("reset-verify");
    setCode("");
    setNewPassword("");
    okToast(t("loginResetCodeSent"));
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      errToast(t("loginEnterCode"));
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      errToast(t("loginPasswordTooShort"));
      return;
    }
    setLoading(true);
    const err = await verifyResetPasswordCode(code.trim(), newPassword);
    setLoading(false);
    if (err) {
      errToast(err);
      return;
    }
    okToast(t("loginPasswordUpdated"));
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };
  const handleApple = async () => {
    setLoading(true);
    await signInWithApple();
  };

  const subtitle = (() => {
    switch (mode) {
      case "password":
        return t("loginSubtitlePassword");
      case "code":
        return t("loginSubtitleCode");
      case "code-pending":
        return interp("loginCodeSentTo", { email });
      case "mfa-pending":
        return interp("loginMfaSentTo", { email });
      case "totp-pending":
        return t("loginTotpSubtitle");
      case "backup-code":
        return t("loginBackupSubtitle");
      case "reset-request":
        return t("loginResetRequestSubtitle");
      case "reset-verify":
        return interp("loginResetCodeSentTo", { email });
    }
  })();

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <header className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-border bg-sand/90 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Murcielingo" className="h-8 w-8" />
          <span className="font-heading font-bold text-lg text-foreground">Murcielingo</span>
        </Link>
        <LanguageToggle variant="globe" />
      </header>

      <div className="flex-1 flex justify-center px-4 pt-8 sm:pt-12 pb-6">
        <div className="w-full max-w-sm" style={{ animation: "fade-in 0.4s ease-out both" }}>
          <div className="text-center mb-5">
            <img src={logo} alt="Murcielingo" className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-3" />
            <h1 className="text-2xl font-heading font-bold text-foreground">{t("login")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            {mode === "password" && (
              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
                      placeholder="email@example.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-foreground">
                      {t("loginPasswordLabel")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("reset-request")}
                      className="text-xs text-peach-dark hover:underline"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("loginSubmit")}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("code")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition"
                >
                  {t("loginUseCodeInstead")}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">{t("orLoginWith")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading}
                    className="py-2 rounded-lg bg-background border border-border text-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={handleApple}
                    disabled={loading}
                    className="py-2 rounded-lg bg-background border border-border text-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z" />
                    </svg>
                    Apple
                  </button>
                </div>
              </form>
            )}

            {mode === "code" && (
              <form onSubmit={handleSendCode} className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("loginUsePassword")}
                </button>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
                      placeholder="email@example.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("loginSendCode")}
                </button>
              </form>
            )}

            {(mode === "totp-pending" || mode === "backup-code") && (
              <form onSubmit={handleVerifyTotp} className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setCode("");
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("loginBack")}
                </button>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {mode === "backup-code" ? t("loginBackupCode") : t("loginAuthenticatorCode")}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm tracking-widest"
                      placeholder={mode === "backup-code" ? "abcd-1234" : "123456"}
                      inputMode={mode === "backup-code" ? "text" : "numeric"}
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full py-2.5 rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("loginVerify")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "backup-code" ? "totp-pending" : "backup-code");
                    setCode("");
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition"
                >
                  {mode === "backup-code" ? t("loginUseAuthenticatorInstead") : t("loginUseBackupInstead")}
                </button>
              </form>
            )}

            {(mode === "code-pending" || mode === "mfa-pending") && (
              <form onSubmit={mode === "mfa-pending" ? handleVerifyMfa : handleVerify} className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "mfa-pending" ? "password" : "code");
                    setCode("");
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("loginBack")}
                </button>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {t("loginVerificationCode")}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm tracking-widest"
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full py-2.5 rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("loginSubmit")}
                </button>

                {mode === "code-pending" && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                  >
                    {resending ? t("loginSending") : t("loginResend")}
                  </button>
                )}
              </form>
            )}

            {mode === "reset-request" && (
              <form onSubmit={handleSendReset} className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("loginBackToSignIn")}
                </button>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
                      placeholder="email@example.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("loginSendResetCode")}
                </button>
              </form>
            )}

            {mode === "reset-verify" && (
              <form onSubmit={handleVerifyReset} className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMode("reset-request")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("loginChangeEmail")}
                </button>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {t("loginVerificationCode")}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm tracking-widest"
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {t("loginNewPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full bg-peach hover:bg-peach-dark text-primary-foreground font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("loginResetAndSignIn")}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("loginNoAccount")}{" "}
            <Link to="/register" className="text-peach-dark hover:underline font-medium">
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
