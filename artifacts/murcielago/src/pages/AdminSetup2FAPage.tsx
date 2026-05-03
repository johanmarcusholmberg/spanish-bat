import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Copy, Check } from "lucide-react";

interface TotpResource {
  uri?: string | null;
  secret?: string | null;
}

interface BackupCodeResource {
  codes?: string[];
}

const AdminSetup2FAPage: React.FC = () => {
  const { isAdmin, adminTotpEnrolled, loading } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState<"intro" | "verify" | "backup">("intro");
  const [totp, setTotp] = useState<TotpResource | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  if (loading || !isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  if (adminTotpEnrolled && step !== "backup") return <Navigate to="/admin" replace />;

  const errToast = (msg: string) => toast({ title: msg, variant: "soft" });

  const start = async () => {
    if (!clerkUser) return;
    setBusy(true);
    try {
      const created = (await clerkUser.createTOTP()) as TotpResource;
      setTotp(created);
      setStep("verify");
    } catch (err) {
      errToast(err instanceof Error ? err.message : "Could not start 2FA setup");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!clerkUser) return;
    if (!code.trim()) {
      errToast("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      await clerkUser.verifyTOTP({ code: code.trim() });
      const backup = (await clerkUser.createBackupCode()) as BackupCodeResource;
      setBackupCodes(backup.codes ?? []);
      api.audit.twoFaEnrolled().catch(() => {});
      setStep("backup");
      toast({ title: "Two-factor authentication enabled." });
    } catch (err) {
      errToast(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!totp?.secret) return;
    await navigator.clipboard.writeText(totp.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-peach-dark" />
              <CardTitle>Set up admin 2FA</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Admins are required to use an authenticator app. Backup codes are issued once — store
              them somewhere safe.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "intro" && (
              <>
                <p className="text-sm">
                  Use 1Password, Google Authenticator, Authy, or any TOTP-compatible authenticator. We'll
                  show you a setup secret and an otpauth:// URI you can paste in.
                </p>
                <Button onClick={start} disabled={busy} className="w-full">
                  {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Start setup
                </Button>
              </>
            )}

            {step === "verify" && (
              <>
                <div>
                  <Label className="text-xs">Setup secret</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-md bg-muted font-mono text-sm break-all">
                      {totp?.secret ?? "—"}
                    </code>
                    <Button type="button" variant="outline" size="sm" onClick={copySecret}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                {totp?.uri && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Show otpauth:// URI</summary>
                    <code className="block mt-1 p-2 bg-muted rounded break-all font-mono">{totp.uri}</code>
                  </details>
                )}
                <div>
                  <Label htmlFor="totp-code" className="text-xs">6-digit code</Label>
                  <Input
                    id="totp-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                    className="mt-1 tracking-widest"
                  />
                </div>
                <Button onClick={verify} disabled={busy || !code.trim()} className="w-full">
                  {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Verify & enable
                </Button>
              </>
            )}

            {step === "backup" && (
              <>
                <p className="text-sm">
                  Save these one-time backup codes — each can be used once if you lose access to your
                  authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((bc) => (
                    <code key={bc} className="px-3 py-2 rounded-md bg-muted font-mono text-sm text-center">
                      {bc}
                    </code>
                  ))}
                </div>
                <Button onClick={() => navigate("/admin")} className="w-full">
                  Continue to admin
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminSetup2FAPage;
