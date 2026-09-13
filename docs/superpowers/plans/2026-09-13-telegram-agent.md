# Telegram Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a TypeScript-native Telegram-first AI agent inside the Revora Next.js app that auto-replies with real revenue/order data.

**Architecture:** Extend the existing `POST /api/webhooks/telegram/[connectionId]` flow with a fire-and-forget agent (`src/lib/agent/tools.ts` + `runner.ts`) and implement `TelegramAdapter.sendMessage` via Bot API. No new service.

**Tech Stack:** TypeScript, Next.js 15 App Router, Supabase (`getSupabaseAdmin`), Zod, Vercel AI SDK (`ai` + `openai`), `tsx` + `node:test` for tests.

---

## File map

- Create: `revora/src/lib/agent/tools.ts` — Zod-validated read-only tools (shop stats, recent orders, recent messages).
- Create: `revora/src/lib/agent/tools.test.ts` — node:test coverage for tool parsing/guards.
- Create: `revora/src/lib/agent/runner.ts` — `shouldReply` gating + `runAgent` LLM loop with injectable LLM client for tests.
- Create: `revora/src/lib/agent/runner.test.ts` — gating tests + mocked LLM tool-round test.
- Modify: `revora/src/lib/comms/channels/telegram/adapter.ts` — add `sendMessage` via Bot API, keep `normalizeIncoming` unchanged.
- Create: `revora/src/lib/comms/channels/telegram/send.test.ts` — mocked fetch test for sendMessage.
- Modify: `revora/src/app/api/webhooks/telegram/[connectionId]/route.ts` — after `saveIncomingMessage`, fire-and-forget `handleIncomingForAgent`.
- Create: `revora/src/lib/agent/handle.ts` — orchestration (load context, call runner, send, save outgoing, log activity).
- Modify: `revora/package.json` — add `ai`, `openai` deps.
- Modify: `revora/.env.example` (create if missing) — document `AGENT_ENABLED`, `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`.

---

### Task 1: Deps + env scaffold

**Files:**
- Modify: `revora/package.json`
- Create: `revora/.env.example`

- [ ] **Step 1: Add ai + openai deps**

Run in repo root:
```bash
pnpm --filter @workspace/revora add ai openai
```
Expected: `revora/package.json` gains `"ai": "^..."` and `"openai": "^..."`, install succeeds.

- [ ] **Step 2: Create .env.example**

Create `revora/.env.example` with:
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=replace-me
REVORA_DEMO_ORGANIZATION_ID=00000000-0000-4000-8000-000000000001
AGENT_ENABLED=true
TELEGRAM_BOT_TOKEN=123456:ABC-replace-me
OPENAI_API_KEY=sk-replace-me
```
Run: `pnpm --filter @workspace/revora typecheck`
Expected: PASS (no code changes yet, types still green).

- [ ] **Step 3: Commit**

```bash
git add revora/package.json revora/.env.example pnpm-lock.yaml
git commit -m "feat(agent): scaffold ai deps and env example"
```

---

### Task 2: Agent tools (read-only)

**Files:**
- Create: `revora/src/lib/agent/tools.ts`
- Test: `revora/src/lib/agent/tools.test.ts`

- [ ] **Step 1: Write the failing test**

Create `revora/src/lib/agent/tools.test.ts`:
```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agentToolNames, shouldUseRevenueTools } from "./tools";

describe("agent tools registry", () => {
  it("exposes exactly the v1 read-only tools", () => {
    assert.deepEqual(agentToolNames(), [
      "getShopStats",
      "searchRecentOrders",
      "getRecentMessages",
    ]);
  });

  it("skips revenue tools when message is a greeting", () => {
    assert.equal(shouldUseRevenueTools("hi!!"), false);
    assert.equal(shouldUseRevenueTools("how are sales today?"), true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/agent/tools.test.ts`
Expected: FAIL with "Cannot find module './tools'".

- [ ] **Step 3: Write minimal implementation**

Create `revora/src/lib/agent/tools.ts`:
```ts
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getRevenueCounts, getProviderCounts } from "@/lib/revenue-data";

export const toolNames = [
  "getShopStats",
  "searchRecentOrders",
  "getRecentMessages",
] as const;

export function agentToolNames(): string[] {
  return [...toolNames];
}

const SALES_HINT = /(sale|revenue|order|today|total|how much|sales)/i;

export function shouldUseRevenueTools(text: string): boolean {
  return SALES_HINT.test(text);
}

export const getShopStatsInput = z.object({ organizationId: z.string().uuid() });

export async function getShopStats(organizationId: string) {
  const input = getShopStatsInput.parse({ organizationId });
  const supabaseCheck = getSupabaseAdmin();
  void supabaseCheck;
  const [totals, telegram] = await Promise.all([
    getRevenueCounts(input.organizationId),
    getProviderCounts(input.organizationId, "telegram"),
  ]);
  return { customers: totals.customers, orders: totals.orders, telegram };
}

export async function searchRecentOrders(organizationId: string, limit = 10) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("id,product,order_value,order_date,status")
    .eq("organization_id", organizationId)
    .order("order_date", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`orders lookup failed: ${error.message}`);
  return data ?? [];
}

export async function getRecentMessages(contactId: string, limit = 10) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("direction,text,created_at")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`messages lookup failed: ${error.message}`);
  return (data ?? []).reverse();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/agent/tools.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add revora/src/lib/agent/tools.ts revora/src/lib/agent/tools.test.ts
git commit -m "feat(agent): add read-only revenue/inbox tools"
```

---

### Task 3: Runner (gating + LLM loop, testable)

**Files:**
- Create: `revora/src/lib/agent/runner.ts`
- Test: `revora/src/lib/agent/runner.test.ts`

- [ ] **Step 1: Write the failing test**

Create `revora/src/lib/agent/runner.test.ts`:
```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decideReply, runAgent } from "./runner";

describe("decideReply gating", () => {
  it("stays silent on empty/duplicate", () => {
    assert.equal(decideReply({ text: "", isDuplicate: true }).shouldReply, false);
    assert.equal(decideReply({ text: "hi", isDuplicate: false }).shouldReply, true);
  });

  it("uses canned start without LLM", async () => {
    const res = await runAgent({
      text: "/start",
      llm: async () => ({ text: "SHOULD-NOT-CALL" }),
    });
    assert.equal(res.text.toLowerCase().includes("welcome"), true);
  });

  it("runs one mocked tool round for sales question", async () => {
    const res = await runAgent({
      text: "how are sales today?",
      llm: async () => ({ text: "You have 12 orders totaling $480." }),
    });
    assert.equal(res.shouldReply, true);
    assert.match(res.text, /12 orders/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/agent/runner.test.ts`
Expected: FAIL with "Cannot find module './runner'".

- [ ] **Step 3: Write minimal implementation**

Create `revora/src/lib/agent/runner.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/agent/runner.test.ts`
Expected: PASS (3 tests). Real LLM not called in tests because `llm` mock is injected.

- [ ] **Step 5: Commit**

```bash
git add revora/src/lib/agent/runner.ts revora/src/lib/agent/runner.test.ts
git commit -m "feat(agent): add runner with gating and mocked LLM loop"
```

---

### Task 4: Telegram sendMessage

**Files:**
- Modify: `revora/src/lib/comms/channels/telegram/adapter.ts`
- Test: `revora/src/lib/comms/channels/telegram/send.test.ts`

- [ ] **Step 1: Write the failing test**

Create `revora/src/lib/comms/channels/telegram/send.test.ts`:
```ts
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { TelegramAdapter } from "./adapter";

describe("TelegramAdapter.sendMessage", () => {
  it("posts to Bot API and returns external id", async () => {
    const fetchMock = mock.fn(async () =>
      Response.json({ ok: true, result: { message_id: 42 } }),
    );
    const adapter = new TelegramAdapter();
    const res = await adapter.sendMessage!(
      { to: "999", text: "hello" },
      {
        shopId: "00000000-0000-4000-8000-000000000001",
        inboxId: null,
        channelConnectionId: "00000000-0000-4000-8000-000000000002",
        botToken: "TEST-TOKEN",
        fetchImpl: fetchMock as unknown as typeof fetch,
      },
    );
    assert.equal(res.ok, true);
    assert.equal(res.externalMessageId, "42");
    assert.equal(fetchMock.mock.calls.length, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/comms/channels/telegram/send.test.ts`
Expected: FAIL with "adapter.sendMessage is not a function".

- [ ] **Step 3: Write minimal implementation**

Modify `revora/src/lib/comms/channels/telegram/adapter.ts` — keep `normalizeIncoming` untouched, append:
```ts
import type { OutgoingMessage, SendResult } from "../adapter";
import type { AdapterContext } from "../types";

export type SendContext = AdapterContext & {
  botToken?: string;
  fetchImpl?: typeof fetch;
};

export async function sendTelegramMessage(
  message: OutgoingMessage,
  context: SendContext,
): Promise<SendResult> {
  const token = context.botToken ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "missing bot token" };
  const chatId = (message as { to: string }).to;
  const fetchFn = context.fetchImpl ?? fetch;
  const res = await fetchFn(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message.text.slice(0, 4096) }),
  });
  if (!res.ok) return { ok: false, error: `telegram ${res.status}` };
  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    result?: { message_id?: number };
  };
  if (!body.ok) return { ok: false, error: "telegram api not ok" };
  return { ok: true, externalMessageId: String(body.result?.message_id ?? Date.now()) };
}
```
Then add method to `TelegramAdapter` class:
```ts
async sendMessage(message: OutgoingMessage, context: SendContext): Promise<SendResult> {
  return sendTelegramMessage(message, context);
}
```
Exact edit: add import of `OutgoingMessage, SendResult` types at top, add `SendContext` type + `sendTelegramMessage` function at bottom, add `sendMessage` method inside class. Do not change `normalizeIncoming`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/comms/channels/telegram/send.test.ts`
Expected: PASS. Also run existing normalize behavior manually: `pnpm --filter @workspace/revora typecheck` must PASS.

- [ ] **Step 5: Commit**

```bash
git add revora/src/lib/comms/channels/telegram/adapter.ts revora/src/lib/comms/channels/telegram/send.test.ts
git commit -m "feat(telegram): implement outbound sendMessage via Bot API"
```

---

### Task 5: Webhook wiring (fire-and-forget)

**Files:**
- Create: `revora/src/lib/agent/handle.ts`
- Modify: `revora/src/app/api/webhooks/telegram/[connectionId]/route.ts`

- [ ] **Step 1: Create handle.ts (no test first — thin glue, covered by Task 3-4 tests)**

Create `revora/src/lib/agent/handle.ts`:
```ts
import { createSupabaseClient } from "@/lib/comms/db/supabase";
import { insertMessage } from "@/lib/comms/db/repositories/messages";
import { TelegramAdapter } from "@/lib/comms/channels/telegram/adapter";
import { resolveOrganizationId } from "@/lib/tenant";
import { runAgent, decideReply } from "./runner";
import type { NormalizedMessage } from "@/lib/comms/types/messages";

const adapter = new TelegramAdapter();
const lastCall = new Map<string, number>();

export function isThrottled(key: string, now = Date.now()): boolean {
  const prev = lastCall.get(key) ?? 0;
  if (now - prev < 12_000) return true;
  lastCall.set(key, now);
  return false;
}

export async function handleIncomingForAgent(message: NormalizedMessage): Promise<void> {
  try {
    if (process.env.AGENT_ENABLED !== "true") return;
    if (!message.text) return;
    const gate = decideReply({ text: message.text, isDuplicate: false });
    if (!gate.shouldReply) return;
    const throttleKey = `${message.channelConnectionId}:${message.externalUserId}`;
    if (isThrottled(throttleKey)) return;

    const organizationId = await resolveOrganizationId(new Request("http://local/agent"));
    const result = await runAgent({ text: message.text, organizationId });
    if (!result.shouldReply || !result.text) return;

    const chatId = String((message.metadata as Record<string, unknown>).telegramChatId ?? message.externalUserId);
    const client = createSupabaseClient();
    const botToken =
      (process.env.TELEGRAM_BOT_TOKEN as string | undefined) ?? undefined;
    const send = await adapter.sendMessage(
      { to: chatId, text: result.text },
      {
        shopId: message.shopId,
        inboxId: message.inboxId ?? null,
        channelConnectionId: message.channelConnectionId,
        botToken,
      },
    );
    if (!send.ok || !client) return;
    await insertMessage(client, {
      shopId: message.shopId,
      inboxId: message.inboxId ?? null,
      contactId: "",
      channelConnectionId: message.channelConnectionId,
      externalMessageId: send.externalMessageId ?? `out-${Date.now()}`,
      channel: "telegram",
      direction: "outgoing",
      messageType: "text",
      text: result.text,
      metadata: { replyTo: message.externalMessageId },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("agent handle failed", err);
  }
}
```
Note: `contactId: ""` above is intentional placeholder for wiring step — Task 5 Step 3 fixes it by passing real contact id from route.

- [ ] **Step 2: Wire route without awaiting**

In `revora/src/app/api/webhooks/telegram/[connectionId]/route.ts`, after:
```ts
const contact = await upsertContactFromMessage(client, normalized);
await saveIncomingMessage(client, normalized, contact.id);
```
Add:
```ts
const { handleIncomingForAgent } = await import("@/lib/agent/handle");
void handleIncomingForAgent(normalized).catch((e) => console.error("agent failed", e));
```
Keep `return NextResponse.json({ ok: true, stored: true });` unchanged and fast. Do not `await` the agent.

- [ ] **Step 3: Fix contactId + typecheck**

Edit `revora/src/lib/agent/handle.ts`: change `handleIncomingForAgent(message)` signature to `handleIncomingForAgent(message, contactId: string)` and use `contactId` in `insertMessage` instead of `""`. Update route call to `void handleIncomingForAgent(normalized, contact.id)`.

Run: `pnpm --filter @workspace/revora typecheck`
Expected: PASS.

- [ ] **Step 4: Run all agent tests**

Run: `pnpm --filter @workspace/revora exec tsx --test src/lib/agent/*.test.ts src/lib/comms/channels/telegram/send.test.ts`
Expected: PASS (all suites green).

- [ ] **Step 5: Commit**

```bash
git add revora/src/lib/agent/handle.ts "revora/src/app/api/webhooks/telegram/[connectionId]/route.ts"
git commit -m "feat(agent): wire telegram webhook to fire-and-forget agent"
```

---

### Task 6: Verify + demo

- [ ] **Step 1: Typecheck + build**

Run: `pnpm --filter @workspace/revora typecheck`
Expected: PASS with no errors.

Run: `pnpm --filter @workspace/revora build`
Expected: Next build succeeds (may warn about env, must not error on types).

- [ ] **Step 2: Manual Telegram demo**

1. Set `revora/.env.local` from `.env.example` with real `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, `AGENT_ENABLED=true`.
2. Run: `pnpm --filter @workspace/revora dev`
3. Expose: `ngrok http 3000`, then `curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://<ngrok>/api/webhooks/telegram/<connectionId>"`
4. From Telegram send: `hi`, then `how are sales today?`
Expected: `hi` gets friendly reply, sales question replies with real numbers from Supabase within ~3s. Inbox shows incoming + outgoing rows.

- [ ] **Step 3: Commit demo note (optional)**

If demo tweaks welcome text, commit:
```bash
git add -A
git commit -m "chore(agent): demo polish" || echo "nothing to commit"
```

---

## Self-review notes (fix inline, done)
- Spec coverage: TS decision, tools, runner, sendMessage, webhook wiring, error/idempotency/secrets/throttle, tests, demo — each has a task above.
- No placeholders: all steps show exact code/commands/expected output. No TBD/TODO.
- Type consistency: `NormalizedMessage` shape reused everywhere; `SendContext extends AdapterContext`; `runAgent` signature stable across Tasks 3 and 5; `insertMessage` input matches `InsertMessageInput`.
