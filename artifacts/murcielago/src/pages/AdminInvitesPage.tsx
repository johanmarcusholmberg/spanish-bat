import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Trash2, UserPlus } from "lucide-react";

type InviteRow = {
  id: number;
  email: string;
  role: string;
  clerk_user_id: string | null;
  invited_by_email: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  status: "pending" | "accepted" | "active";
};

const AdminInvitesPage: React.FC = () => {
  const { isAdmin, adminTotpEnrolled, loading } = useAuth();
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(true);

  const errToast = (msg: string) => toast({ title: msg, variant: "soft" });

  const reload = async () => {
    setRefreshing(true);
    try {
      const data = await api.admin.invites.list();
      setInvites(data.invites);
    } catch (err) {
      errToast(err instanceof Error ? err.message : "Could not load invites");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminTotpEnrolled) reload();
  }, [isAdmin, adminTotpEnrolled]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  if (!adminTotpEnrolled) return <Navigate to="/admin/setup-2fa" replace />;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      errToast("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.admin.invites.create(trimmed, "admin");
      if (!result.clerkInvited && result.clerkError) {
        toast({
          title: `Invite saved, but Clerk invitation failed: ${result.clerkError}`,
          variant: "soft",
        });
      } else {
        toast({ title: `Invite sent to ${trimmed}` });
      }
      setEmail("");
      await reload();
    } catch (err) {
      errToast(err instanceof Error ? err.message : "Could not create invite");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Revoke this invite?")) return;
    try {
      await api.admin.invites.remove(id);
      toast({ title: "Invite revoked." });
      await reload();
    } catch (err) {
      errToast(err instanceof Error ? err.message : "Could not revoke invite");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-peach-dark" />
              <CardTitle>Invite a new admin</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sends a Clerk-hosted invitation. The recipient must complete TOTP enrolment on first sign-in.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={create} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="new-admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" disabled={busy || !email.trim()}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send invite
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing invites & admins</CardTitle>
          </CardHeader>
          <CardContent>
            {refreshing ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : invites.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No invites yet.</p>
            ) : (
              <div className="divide-y">
                {invites.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{inv.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {inv.role} · invited{" "}
                        {inv.invited_at ? new Date(inv.invited_at).toLocaleString() : "—"}
                        {inv.invited_by_email ? ` by ${inv.invited_by_email}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={inv.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {inv.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(inv.id)}
                        title="Revoke invite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminInvitesPage;
