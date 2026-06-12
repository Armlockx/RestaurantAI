import { buildSystemPrompt } from "./cart-actions";
import { menuToPromptText } from "./menu-data";
import { getMenuItems } from "./menu";
import type { ChatMessage } from "./types";

export async function chatWithGroq(
  pergunta: string,
  history: ChatMessage[]
): Promise<{ content: string; model: string; latencyMs: number }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY não configurada");
  }

  const menu = await getMenuItems();
  const isFirst = !history || history.length === 0;
  const menuText = menuToPromptText(menu, !isFirst);
  const systemContent = buildSystemPrompt(menuText, !isFirst);

  const messages = [
    { role: "system" as const, content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: pergunta },
  ];

  const start = Date.now();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_completion_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
    model?: string;
  };

  return {
    content: data.choices[0]?.message?.content ?? "",
    model: data.model ?? "llama-3.3-70b-versatile",
    latencyMs: Date.now() - start,
  };
}
