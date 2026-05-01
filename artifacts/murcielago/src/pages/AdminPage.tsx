import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";
import { Loader2, Shield, Users, TrendingUp, MessageSquare, BarChart3, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface AdminUser {
  user_id: string;
  display_name: string | null;
  email: string;
  level: string;
  learning_from: string;
  account_status: string;
  created_at: string;
  roles: string[];
  streak: { current: number; longest: number; last_active: string | null } | null;
  progress: { category: string; completed: number; total: number }[];
  last_activity: { type: string; label: string; date: string } | null;
}

interface ContactMessage {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_id: string | null;
}

interface Insights {
  levelDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  recentSignups: number;
  activeUsersLastWeek: number;
  categoryProgress: Record<string, { completed: number; total: number }>;
  vocabularyStats: { total: number; learned: number };
}

const StatusBadge = ({ status, t }: { status: string; t: (k: string) => string }) => {
  const styles: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-600 border-blue-200",
    in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    resolved: "bg-green-500/10 text-green-600 border-green-200",
  };
  const labels: Record<string, string> = {
    new: t("statusNew"),
    in_progress: t("statusInProgress"),
    resolved: t("statusResolved"),
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.new}`}>
      {labels[status] || status}
    </span>
  );
};

const MetricCard = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </CardContent>
  </Card>
);

const AdminPage = () => {
  const { isAdmin, isLoggedIn, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const fetchUsers = useCallback(async () => {
    const data = await api.admin.getUsers();
    return data.users || [];
  }, []);

  const fetchMessages = useCallback(async () => {
    const data = await api.admin.getMessages();
    return data.messages || [];
  }, []);

  const fetchInsights = useCallback(async () => {
    return await api.admin.getInsights();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, m, i] = await Promise.all([fetchUsers(), fetchMessages(), fetchInsights()]);
        setUsers(u);
        setMessages(m);
        setInsights(i);
      } catch (err: any) {
        setError(err.message || t("serverError"));
      }
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const notes = editingNotes[messageId];
      await api.admin.updateMessage(messageId, {
        status,
        ...(notes !== undefined ? { adminNotes: notes } : {}),
      });
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, status, ...(notes !== undefined ? { admin_notes: notes } : {}) } : m));
      toast({ title: "✓", description: `Status → ${status}` });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const saveNotes = async (messageId: string) => {
    try {
      const notes = editingNotes[messageId] || "";
      const status = messages.find(m => m.id === messageId)?.status || "new";
      await api.admin.updateMessage(messageId, { status, adminNotes: notes });
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, admin_notes: notes } : m));
      toast({ title: "✓", description: t("saveNotes") });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!isAdmin) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{t("permissionDenied")}</p>
      </div>
    </AppLayout>
  );

  const totalProgress = (user: AdminUser) => {
    if (!user.progress.length) return 0;
    const c = user.progress.reduce((s, p) => s + p.completed, 0);
    const t = user.progress.reduce((s, p) => s + p.total, 0);
    return t > 0 ? Math.round((c / t) * 100) : 0;
  };

  const pendingCount = messages.filter((m) => m.status === "new").length;

  // ─── RENDER ───

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={Users} label={t("totalUsers")} value={users.length} />
        <MetricCard icon={TrendingUp} label={t("activeUsersWeek")} value={insights?.activeUsersLastWeek ?? "—"} />
        <MetricCard icon={TrendingUp} label={t("activeStreaks")} value={users.filter((u) => u.streak && u.streak.current > 0).length} />
        <MetricCard icon={Shield} label={t("adminCount")} value={users.filter((u) => u.roles.includes("admin")).length} />
        <MetricCard icon={Users} label={t("recentSignups")} value={insights?.recentSignups ?? "—"} />
        <MetricCard icon={MessageSquare} label={t("pendingMessages")} value={pendingCount} />
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("recentSignups")}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noUsers")}</p>
          ) : (
            <div className="space-y-2">
              {users.slice(0, 5).map((u) => (
                <div key={u.user_id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium text-sm text-foreground">{u.display_name || u.email.split("@")[0]}</span>
                    <span className="text-muted-foreground text-xs ml-2">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{u.level}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      {users.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">{t("noUsers")}</CardContent></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("displayName")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("email")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("levelLabel")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("progressLabel")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("currentStreak")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("adminRoles")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("accountStatus")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("lastActivity")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("registered")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                    <td className="p-3 text-foreground font-medium">{u.display_name || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-xs">{u.level}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${totalProgress(u)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{totalProgress(u)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-foreground text-sm">
                      {u.streak ? `🔥 ${u.streak.current}` : "—"}
                    </td>
                    <td className="p-3 text-center">
                      {u.roles.map((r) => (
                        <Badge key={r} variant={r === "admin" ? "destructive" : "secondary"} className="text-xs mr-1">
                          {r}
                        </Badge>
                      ))}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-xs capitalize">{u.account_status}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {u.last_activity ? (
                        <span title={u.last_activity.date}>{u.last_activity.label}</span>
                      ) : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">{t("noMessages")}</CardContent></Card>
      ) : (
        messages.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm text-foreground">{m.subject}</span>
                    <StatusBadge status={m.status} t={t} />
                  </div>
                  <p className="text-xs text-muted-foreground">{m.email} · {new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <Select value={m.status} onValueChange={(v) => updateMessageStatus(m.id, v)}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("statusNew")}</SelectItem>
                    <SelectItem value="in_progress">{t("statusInProgress")}</SelectItem>
                    <SelectItem value="resolved">{t("statusResolved")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{m.message}</p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("adminNotes")}</label>
                <div className="flex gap-2">
                  <Textarea
                    className="text-xs min-h-[60px]"
                    value={editingNotes[m.id] ?? m.admin_notes ?? ""}
                    onChange={(e) => setEditingNotes((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder={t("adminNotes")}
                  />
                  <Button size="sm" variant="outline" onClick={() => saveNotes(m.id)} className="shrink-0 self-end">
                    {t("saveNotes")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderInsights = () => {
    if (!insights) return <Card><CardContent className="py-8 text-center text-muted-foreground">{t("noData")}</CardContent></Card>;

    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const maxLevel = Math.max(...levels.map((l) => insights.levelDistribution[l] || 0), 1);

    return (
      <div className="space-y-6">
        {/* Level distribution */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{t("levelDistribution")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {levels.map((l) => {
                const count = insights.levelDistribution[l] || 0;
                return (
                  <div key={l} className="text-center space-y-1">
                    <div className="h-20 flex items-end justify-center">
                      <div
                        className="w-8 bg-primary/80 rounded-t transition-all"
                        style={{ height: `${(count / maxLevel) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                      />
                    </div>
                    <p className="text-xs font-medium text-foreground">{l}</p>
                    <p className="text-xs text-muted-foreground">{count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category usage */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{t("categoryUsage")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(insights.categoryProgress).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground capitalize">{cat}</span>
                    <span className="text-muted-foreground text-xs">{data.completed}/{data.total} ({pct}%)</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
            {Object.keys(insights.categoryProgress).length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Vocabulary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard icon={BarChart3} label={t("wordsTotal")} value={insights.vocabularyStats.total} />
          <MetricCard icon={CheckCircle2} label={t("wordsLearned")} value={insights.vocabularyStats.learned} />
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("adminPanel")}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-destructive font-medium">{t("serverError")}</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4 hidden sm:block" />{t("adminOverview")}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
                <Users className="h-4 w-4 hidden sm:block" />{t("adminUsers")}
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-1.5 text-xs sm:text-sm relative">
                <MessageSquare className="h-4 w-4 hidden sm:block" />{t("adminSupport")}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1.5 text-xs sm:text-sm">
                <TrendingUp className="h-4 w-4 hidden sm:block" />{t("adminInsights")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">{renderOverview()}</TabsContent>
            <TabsContent value="users" className="mt-4">{renderUsers()}</TabsContent>
            <TabsContent value="support" className="mt-4">{renderSupport()}</TabsContent>
            <TabsContent value="insights" className="mt-4">{renderInsights()}</TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminPage;
