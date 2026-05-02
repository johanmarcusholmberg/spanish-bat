import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/translate", requireAuth, async (req, res) => {
  const { text, targetLang = "sv" } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const langName = targetLang === "sv" ? "Swedish" : "English";
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      messages: [
        {
          role: "system",
          content: `You are a Spanish language expert. Translate the given Spanish text to ${langName}. Return a JSON object with: translation (string), itemType ("word", "phrase", or "sentence"), original (the original text), and usageExample (an example sentence using the word/phrase in Spanish). No extra text.`,
        },
        { role: "user", content: text.trim() },
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    try {
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    } catch {
      return res.json({ translation: raw, itemType: "word", original: text.trim() });
    }
  } catch (err) {
    req.log.error({ err }, "Translation failed");
    return res.status(500).json({ error: "Translation failed" });
  }
});

router.post("/conversation", requireAuth, async (req, res): Promise<void> => {
  const { messages, scenario, level = "A1", learningFrom = "sv" } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const langName = learningFrom === "sv" ? "Swedish" : "English";
    const systemPrompt = `You are a friendly Spanish language conversation partner. The user is learning Spanish at CEFR level ${level}. ${scenario ? `Scenario: ${scenario}` : "Have a free conversation."} Respond in Spanish appropriate for level ${level}. If the user writes in ${langName}, gently encourage them to respond in Spanish. Keep responses concise (1-3 sentences). After your response, add a helpful note in ${langName} if needed.`;

    type UserMessage = { role: "user" | "assistant"; content: string };
    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: UserMessage) => ({ role: m.role, content: String(m.content) })),
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    req.log.error({ err }, "Conversation streaming failed");
    res.write(`data: ${JSON.stringify({ error: "Conversation failed" })}\n\n`);
    res.end();
  }
});

export default router;
