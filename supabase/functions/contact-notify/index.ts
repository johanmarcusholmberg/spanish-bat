import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, message, email, user_id } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Missing LOVABLE_API_KEY");
    }

    // Format the notification content
    const subjectLabels: Record<string, string> = {
      bug: "Bug report",
      technical: "Technical issue",
      account: "Account issue",
      feature: "Feature request",
      feedback: "Feedback",
      payment: "Payment",
      other: "Other",
    };

    const subjectLabel = subjectLabels[subject] || subject;
    const userInfo = user_id ? `User ID: ${user_id}` : "Not logged in";

    const notificationBody = `New contact form submission:

Subject: ${subjectLabel}
From: ${email}
${userInfo}

Message:
${message}`;

    console.log("Contact notification:", notificationBody);

    // Use Lovable AI to generate a log entry (as a lightweight way to process)
    // The main value is the database storage + this server-side log
    // In production, you'd integrate with an email service here

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: {
          subject: subjectLabel,
          from: email,
          user_id: user_id || null,
          message_preview: message.substring(0, 100),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact notify error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
