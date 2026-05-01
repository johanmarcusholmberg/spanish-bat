import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationScenario = {
  scenario: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/conversation`;

export function useConversationStream() {
  const { user, session } = useAuth();

  const getAuthHeaders = useCallback(() => {
    if (!session?.access_token) {
      throw new Error("You need to be signed in to use conversation practice.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };
  }, [session?.access_token]);

  const streamChat = useCallback(
    async (
      allMessages: ConversationMessage[],
      scenario: ConversationScenario,
      onDelta: (text: string) => void
    ) => {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          level: user?.level || "A1",
          scenario: scenario.scenario,
          learningFrom: user?.learningFrom || "sv",
          messages: allMessages,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) {
            line = line.slice(0, -1);
          }

          if (!line.trim() || line.startsWith(":")) {
            newlineIndex = buffer.indexOf("\n");
            continue;
          }

          if (!line.startsWith("data: ")) {
            newlineIndex = buffer.indexOf("\n");
            continue;
          }

          const payload = line.slice(6).trim();

          if (payload === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onDelta(content);
            }
          } catch {
            // Ignore malformed partial chunk
          }

          newlineIndex = buffer.indexOf("\n");
        }
      }
    },
    [getAuthHeaders, user?.learningFrom, user?.level]
  );

  return { streamChat };
}
