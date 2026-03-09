import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Users, TrendingUp } from "lucide-react";

interface AdminUser {
  user_id: string;
  display_name: string | null;
  email: string;
  level: string;
  learning_from: string;
  created_at: string;
  roles: string[];
  streak: { current: number; longest: number; last_active: string | null } | null;
  progress: { category: string; completed: number; total: number }[];
}

const AdminPage = () => {
  const { isAdmin, isLoggedIn, loading: authLoading, session } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin || !session) return;

    const fetchUsers = async () => {
      setLoading(true);
      const { data, error: fnError } = await supabase.functions.invoke("admin-users");
      if (fnError) {
        setError(fnError.message);
      } else if (data?.error) {
        setError(data.error);
      } else {
        setUsers(data.users || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [isAdmin, session]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const totalProgress = (user: AdminUser) => {
    if (!user.progress.length) return 0;
    const totalCompleted = user.progress.reduce((s, p) => s + p.completed, 0);
    const totalItems = user.progress.reduce((s, p) => s + p.total, 0);
    return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  };

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("adminPanel")}</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" />
              {t("totalUsers")}
            </div>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              {t("activeStreaks")}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.streak && u.streak.current > 0).length}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Shield className="h-4 w-4" />
              {t("adminCount")}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.roles.includes("admin")).length}
            </p>
          </div>
        </div>

        {/* Users table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("displayName")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("email")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("levelLabel")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("progressLabel")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("currentStreak")}</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">{t("adminRoles")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("registered")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                    <td className="p-3 text-foreground font-medium">{u.display_name || "—"}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {u.level}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${totalProgress(u)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{totalProgress(u)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-foreground">
                      {u.streak ? `🔥 ${u.streak.current}` : "—"}
                    </td>
                    <td className="p-3 text-center">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-1 ${
                            r === "admin"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminPage;
