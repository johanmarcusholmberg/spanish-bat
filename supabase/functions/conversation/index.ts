import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type RequestBody = {
  level?: string;
  scenario?: string;
  messages?: ChatMessage[];
  learningFrom?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return jsonResponse({ error: "Supabase environment is not configured." }, 500);
    }

    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "LOVABLE_API_KEY is not configured." }, 500);
    }

    const token = getBearerToken(req);
    if (!token) {
      return jsonResponse({ error: "Missing bearer token." }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const body = (await req.json()) as RequestBody;
    const level = body.level || "A1";
    const scenario = body.scenario || "general conversation";
    const learningFrom = body.learningFrom || "sv";
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length > 50) {
      return jsonResponse({ error: "Too many messages in a single request." }, 400);
    }

    const safeMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 2000),
      }));

    const nativeLang = learningFrom === "sv" ? "Swedish" : "English";

    // Optional lightweight logging / guardrail
    console.log("conversation request", {
      userId: user.id,
      level,
      scenario,
      messageCount: safeMessages.length,
    });

    const systemPrompt = `You are a friendly Spanish conversation partner helping a student practice everyday Spanish conversations.

The student's level is ${level} (CEFR).

RULES:
- You play the role of a native Spanish speaker in a realistic everyday scenario: "${scenario}"
- Adapt vocabulary and grammar complexity to ${level} level
- Keep your responses SHORT (1-3 sentences max) to encourage back-and-forth
- After each response, do NOT explain grammar unless asked
- If the student makes errors, gently model the correct form in your reply naturally (don't explicitly correct)
- Stay in character and keep the conversation flowing naturally
- Write ONLY in Spanish in your conversation turns
- If this is the START of a conversation (no prior messages), begin with a natural opening line for the scenario
- When the user sends "[HINT]", provide a helpful suggestion in ${nativeLang} for what they could say next, then continue waiting
- When the user sends "[TRANSLATE]", translate your last message to ${nativeLang}
- When the user sends "[END]", give a brief farewell in Spanish, then on a new line write "---" followed by brief feedback in ${nativeLang} about their performance (strengths, areas to improve, new vocabulary learned).`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...safeMessages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      }

      if (response.status === 402) {
        return jsonResponse({ error: "AI credits exhausted. Please add credits." }, 402);
      }

      const t = await response.text();
      console.error("AI gateway error:", response.status, t);

      return jsonResponse({ error: "AI service error" }, 500);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (e) {
    console.error("conversation error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500
    );
  }
});
