import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the calling user is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all profiles
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch all progress
    const { data: progress } = await adminClient
      .from("user_progress")
      .select("*");

    // Fetch all streaks
    const { data: streaks } = await adminClient
      .from("user_streaks")
      .select("*");

    // Fetch all roles
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("*");

    // Fetch auth users for email info
    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers();

    // Merge data
    const usersMap = (profiles || []).map((profile) => {
      const authUser = authUsers?.find((u) => u.id === profile.user_id);
      const userProgress = (progress || []).filter((p) => p.user_id === profile.user_id);
      const userStreak = (streaks || []).find((s) => s.user_id === profile.user_id);
      const userRoles = (roles || []).filter((r) => r.user_id === profile.user_id).map((r) => r.role);

      return {
        user_id: profile.user_id,
        display_name: profile.display_name,
        email: authUser?.email || "unknown",
        level: profile.level,
        learning_from: profile.learning_from,
        created_at: profile.created_at,
        roles: userRoles,
        streak: userStreak ? {
          current: userStreak.current_streak,
          longest: userStreak.longest_streak,
          last_active: userStreak.last_active_date,
        } : null,
        progress: userProgress.map((p) => ({
          category: p.category,
          completed: p.completed,
          total: p.total,
        })),
      };
    });

    return new Response(JSON.stringify({ users: usersMap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
