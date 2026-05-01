import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No auth header");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) throw new Error("Forbidden: admin role required");

  return { user, adminClient };
}

async function logAudit(
  adminClient: ReturnType<typeof createClient>,
  adminUserId: string,
  actionType: string,
  entityType: string,
  entityId: string | null,
  metadata?: Record<string, unknown>
) {
  await adminClient.from("admin_audit_log").insert({
    admin_user_id: adminUserId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata || {},
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const { user, adminClient } = await verifyAdmin(req);

    let result: unknown;

    switch (action) {
      case "update_contact_status": {
        const { message_id, status, admin_notes } = params;
        if (!message_id || !status) throw new Error("Missing message_id or status");
        const updates: Record<string, string> = { status };
        if (admin_notes !== undefined) updates.admin_notes = admin_notes;
        const { error } = await adminClient
          .from("contact_messages")
          .update(updates)
          .eq("id", message_id);
        if (error) throw error;
        await logAudit(adminClient, user.id, "update_contact_status", "contact_message", message_id, { status });
        result = { success: true };
        break;
      }

      case "update_user_role": {
        const { target_user_id, role, action: roleAction } = params;
        if (!target_user_id || !role) throw new Error("Missing target_user_id or role");
        if (roleAction === "remove") {
          const { error } = await adminClient
            .from("user_roles")
            .delete()
            .eq("user_id", target_user_id)
            .eq("role", role);
          if (error) throw error;
        } else {
          const { error } = await adminClient
            .from("user_roles")
            .upsert({ user_id: target_user_id, role }, { onConflict: "user_id,role" });
          if (error) throw error;
        }
        await logAudit(adminClient, user.id, `role_${roleAction || "add"}`, "user", target_user_id, { role });
        result = { success: true };
        break;
      }

      case "get_contact_messages": {
        const { data, error } = await adminClient
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { messages: data };
        break;
      }

      case "get_audit_log": {
        const { data, error } = await adminClient
          .from("admin_audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        result = { logs: data };
        break;
      }

      case "get_insights": {
        // Level distribution
        const { data: profiles } = await adminClient.from("profiles").select("level, account_status, created_at");
        // Activity stats
        const { data: activity } = await adminClient.from("activity_log").select("user_id, activity_date, count");
        // Vocabulary stats
        const { data: vocab } = await adminClient.from("user_vocabulary").select("user_id, learned, review_state");
        // Progress stats
        const { data: progress } = await adminClient.from("user_progress").select("category, completed, total");

        const levelDist: Record<string, number> = {};
        const statusDist: Record<string, number> = {};
        let recentSignups = 0;
        const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

        (profiles || []).forEach((p) => {
          levelDist[p.level] = (levelDist[p.level] || 0) + 1;
          statusDist[p.account_status || "free"] = (statusDist[p.account_status || "free"] || 0) + 1;
          if (p.created_at > oneWeekAgo) recentSignups++;
        });

        // Category progress aggregation
        const categoryStats: Record<string, { completed: number; total: number }> = {};
        (progress || []).forEach((p) => {
          if (!categoryStats[p.category]) categoryStats[p.category] = { completed: 0, total: 0 };
          categoryStats[p.category].completed += p.completed;
          categoryStats[p.category].total += p.total;
        });

        // Unique active users (last 7 days)
        const activeUserIds = new Set<string>();
        (activity || []).forEach((a) => {
          if (a.activity_date >= oneWeekAgo.split("T")[0]) activeUserIds.add(a.user_id);
        });

        // Vocabulary stats
        const totalWords = vocab?.length || 0;
        const learnedWords = vocab?.filter((v) => v.learned).length || 0;

        result = {
          levelDistribution: levelDist,
          statusDistribution: statusDist,
          recentSignups,
          activeUsersLastWeek: activeUserIds.size,
          categoryProgress: categoryStats,
          vocabularyStats: { total: totalWords, learned: learnedWords },
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = String(err).includes("Unauthorized") ? 401
      : String(err).includes("Forbidden") ? 403 : 400;
    return new Response(JSON.stringify({ error: String(err) }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
