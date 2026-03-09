import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { level, scenario, messages, learningFrom } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const nativeLang = learningFrom === "sv" ? "Swedish" : "English";

    const systemPrompt = `You are a friendly Spanish conversation partner helping a student practice everyday Spanish conversations. The student's level is ${level} (CEFR).

RULES:
- You play the role of a native Spanish speaker in a realistic everyday scenario: "${scenario}"
- Adapt vocabulary and grammar complexity to ${level} level
- Keep your responses SHORT (1-3 sentences max) to encourage back-and-forth
- After each response, do NOT explain grammar unless asked
- If the student makes errors, gently model the correct form in your reply naturally (don't explicitly correct)
- Stay in character and keep the conversation flowing naturally
- Write ONLY in Spanish in your conversation turns
- If this is the START of a conversation (no prior messages), begin with a natural opening line for the scenario

When the user sends "[HINT]", provide a helpful suggestion in ${nativeLang} for what they could say next, then continue waiting.
When the user sends "[TRANSLATE]", translate your last message to ${nativeLang}.
When the user sends "[END]", give a brief farewell in Spanish, then on a new line write "---" followed by brief feedback in ${nativeLang} about their performance (strengths, areas to improve, new vocabulary learned).`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("conversation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
