import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationScenario = {
  scenario: string;
};

export function useConversationStream() {
  const { user, isLoggedIn } = useAuth();

  const streamChat = useCallback(
    async (
      allMessages: ConversationMessage[],
      scenario: ConversationScenario,
      onDelta: (text: string) => void
    ) => {
      if (!isLoggedIn) {
        throw new Error("You need to be signed in to use conversation practice.");
      }

      const resp = await fetch("/api/conversation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
    [isLoggedIn, user?.learningFrom, user?.level]
  );

  return { streamChat };
}
