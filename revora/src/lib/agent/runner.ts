import { generateText, stepCountIs, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { getShopStats, searchRecentOrders } from "./tools";
import { resolveOrganizationId } from "@/lib/tenant";

export type LlmFn = (prompt: { system: string; user: string }) => Promise<{ text: string }>;

// AGENTS.md §1: no hardcoded replies. Every user-visible string comes from the
// LLM via Kilo gateway. Gating is only empty/duplicate (decideReply).
export const KILO_BASE_URL = "https://api.kilo.ai/api/gateway";
export const AGENT_MODEL_ID = process.env.AGENT_MODEL ?? "nex-agi/nex-n2.5-mini:free";
export const AGENT_FALLBACK_MODEL_ID =
  process.env.AGENT_FALLBACK_MODEL ?? "kilo-auto/free";
const kilo = createOpenAI({ baseURL: KILO_BASE_URL, apiKey: process.env.KILO_API_KEY });

export function decideReply(opts: { text: string; isDuplicate: boolean }): {
  shouldReply: boolean;
  reason: string;
} {
  if (opts.isDuplicate) return { shouldReply: false, reason: "duplicate" };
  if (!opts.text || !opts.text.trim()) return { shouldReply: false, reason: "empty" };
  return { shouldReply: true, reason: "ok" };
}

const SYSTEM_PROMPT =
  "You are the Revora assistant for a small shop. Friendly, concise, max 300 chars. " +
  "Greet users naturally when they say hi/hello/hey. " +
  "Treat /start as a new conversation and welcome them to Revora, " +
  "mentioning you can help with orders, sales, or support. " +
  "Use tools for real numbers. Never invent order IDs.";

export async function runAgent(opts: {
  text: string;
  organizationId?: string;
  llm?: LlmFn;
  modelId?: string;
}): Promise<{ shouldReply: boolean; text: string }> {
  const text = (opts.text ?? "").trim();
  const gate = decideReply({ text, isDuplicate: false });
  if (!gate.shouldReply) return { shouldReply: false, text: "" };

  if (opts.llm) {
    const out = await opts.llm({ system: SYSTEM_PROMPT, user: text });
    return { shouldReply: true, text: out.text.slice(0, 300) };
  }

  const organizationId =
    opts.organizationId ?? (await resolveOrganizationId(new Request("http://local/agent")));
  const { text: answer } = await generateText({
    model: kilo(opts.modelId ?? AGENT_MODEL_ID),
    system: SYSTEM_PROMPT,
    prompt: text,
    stopWhen: stepCountIs(2),
    tools: {
      getShopStats: tool({
        description: "Shop totals + telegram counts",
        inputSchema: z.object({}),
        execute: async () => getShopStats(organizationId),
      }),
      searchRecentOrders: tool({
        description: "Last 10 orders",
        inputSchema: z.object({}),
        execute: async () => searchRecentOrders(organizationId, 10),
      }),
    },
  });
  return { shouldReply: true, text: answer.slice(0, 300) };
}
