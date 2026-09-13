import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getShopStats, searchRecentOrders } from "./tools";
import { resolveOrganizationId } from "@/lib/tenant";

export type LlmFn = (prompt: { system: string; user: string }) => Promise<{ text: string }>;

export function decideReply(opts: { text: string; isDuplicate: boolean }): {
  shouldReply: boolean;
  reason: string;
} {
  if (opts.isDuplicate) return { shouldReply: false, reason: "duplicate" };
  if (!opts.text || !opts.text.trim()) return { shouldReply: false, reason: "empty" };
  return { shouldReply: true, reason: "ok" };
}

const WELCOME = "Welcome to Revora! Ask me about orders, sales, or support and I'll help.";

export async function runAgent(opts: {
  text: string;
  organizationId?: string;
  llm?: LlmFn;
}): Promise<{ shouldReply: boolean; text: string }> {
  const text = (opts.text ?? "").trim();
  const gate = decideReply({ text, isDuplicate: false });
  if (!gate.shouldReply) return { shouldReply: false, text: "" };
  if (text.startsWith("/start")) return { shouldReply: true, text: WELCOME };

  if (opts.llm) {
    const out = await opts.llm({
      system: "You are Revora assistant. Friendly, concise, max 300 chars.",
      user: text,
    });
    return { shouldReply: true, text: out.text.slice(0, 300) };
  }

  const organizationId =
    opts.organizationId ?? (await resolveOrganizationId(new Request("http://local/agent")));
  const { text: answer } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are Revora assistant. Friendly, concise, max 300 chars. Use tools for real numbers. Never invent order IDs.",
    prompt: text,
    maxSteps: 2,
    tools: {
      getShopStats: tool({
        description: "Shop totals + telegram counts",
        parameters: z.object({}),
        execute: async () => getShopStats(organizationId),
      }),
      searchRecentOrders: tool({
        description: "Last 10 orders",
        parameters: z.object({}),
        execute: async () => searchRecentOrders(organizationId, 10),
      }),
    },
  });
  return { shouldReply: true, text: answer.slice(0, 300) };
}
