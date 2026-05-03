import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ScrollText, Search } from "lucide-react";

type Entry = {
  id: number;
  user_id: string | null;
  email: string | null;
  action: string;
  target: string | null;
  ip: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const AdminAuditPage: React.FC = () => {
  const { isAdmin, adminTotpEnrolled, loading } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [action, setAction] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [refreshing, setRefreshing] = useState(true);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.admin.audit.list({
        action: action || undefined,
        email: email.trim() || undefined,
      });
      setEntries(data.entries);
      setActions(data.actions);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not load audit log",
        variant: "soft",
      });
    } finally {
      setRefreshing(false);
    }
  }, [action, email]);

  useEffect(() => {
    if (isAdmin && adminTotpEnrolled) reload();
  }, [isAdmin, adminTotpEnrolled, reload]);

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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-peach-dark" />
              <CardTitle>Audit log</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              All authentication and admin events recorded server-side. Webhook events from Clerk are
              stored alongside client-reported sign-in/out.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-muted-foreground">Email contains</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="min-w-[180px]">
                <label className="text-xs text-muted-foreground">Action</label>
                <Select value={action || "__all__"} onValueChange={(v) => setAction(v === "__all__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All actions</SelectItem>
                    {actions.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={reload} disabled={refreshing}>
                {refreshing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {refreshing ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2">When</th>
                      <th className="text-left px-3 py-2">Action</th>
                      <th className="text-left px-3 py-2">Email</th>
                      <th className="text-left px-3 py-2">Target</th>
                      <th className="text-left px-3 py-2">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{e.action}</td>
                        <td className="px-3 py-2">{e.email ?? "—"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{e.target ?? "—"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{e.ip ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminAuditPage;
