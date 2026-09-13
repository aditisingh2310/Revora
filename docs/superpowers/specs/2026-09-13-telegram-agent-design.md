# Revora Telegram Agent — Design Spec
Date: 2026-09-13
Status: Approved (verbal yes x4)
Stack decision: TypeScript (unanimous)

## 1. Context
Revora is a single Next.js 15 full-stack app (React 19, Tailwind, Supabase) with pnpm workspace:
- `revora/` — Next.js app + API routes (`/api/connections`, `/api/imports/csv|manual`, `/api/activity`, `/api/webhooks/telegram/[connectionId]`)
- `lib/api-zod/` — shared Zod contracts (Provider, Connection, ImportSummary)
- `lib/api-client-react/` + TanStack Query
- Server Supabase via `getSupabaseAdmin()` service-role (`revora/src/lib/supabase/server.ts`)
- Domain: `revenue-data.ts` (normalize/import/counts), `tenant.ts` (org resolve), `lib/comms/` (Telegram adapter, contact/message/inbox services, channel-agnostic core)
- No Python files. No second runtime.

Goal: TypeScript-native AI agent, Telegram first, for flexibility (reuse types/helpers), power (tool-calling + RAG over Supabase), and demo wow inside the product.

## 2. Architecture (Approved)
Keep everything in `revora/`. New `src/lib/agent/` folder reusing existing primitives.
Flow extends current webhook, does not replace it:
`Telegram POST -> resolve connection -> shop/inbox from OUR DB -> normalize -> upsertContact -> saveIncoming -> NEW trigger agent (fire-and-forget) -> reply -> save outgoing -> always 200 <1s`

No new service, no new deploy. `pnpm build` and `pnpm typecheck` stay green.

## 3. Components (Approved)
Three small files, single responsibility each:

### a) `src/lib/agent/tools.ts`
Zod-validated, read-only v1 (except reply which is separate):
- `getShopStats(organizationId)` -> wraps `getRevenueCounts(orgId)` + `getProviderCounts(orgId,'telegram')`
- `searchRecentOrders({organizationId, customerName?, limit=10})` -> Supabase `orders` filtered by org, ordered desc
- `getRecentMessages({contactId, limit=10})` -> Supabase `messages` for conversational context
No delete/write tools in v1. Safe to demo with partner.

### b) `src/lib/agent/runner.ts`
Brain loop:
- Input: `NormalizedMessage + ContactRow + {shopId, inboxId, organizationId}`
- Org resolution v1: reuse existing `resolveOrganizationId(request)` demo-org helper (single workspace env `REVORA_DEMO_ORGANIZATION_ID`). No new shop->org FK in v1. Future migration adds `shops.organization_id` and webhook resolves it directly; runner signature already accepts it so no refactor needed.
- System prompt: "You are Revora assistant for [shop]. Friendly, concise, use order/revenue data. If unsure, say you'll check with the team."
- LLM: `muse-spark-1.3-contributor-free` via OpenCode Zen (OpenAI-compatible `https://opencode.ai/zen/v1`, `@ai-sdk/openai` `createOpenAI`, key `OPENCODE_ZEN_API_KEY`, override `AGENT_MODEL`), 2 tool steps max, 15s timeout
- Output: `{ shouldReply: boolean, text: string (max ~300 chars) }`
- `/start` handled as canned welcome without LLM call (cost saver).

### c) Telegram outbound
Implement `TelegramAdapter.sendMessage({to, text}, context)` via `POST https://api.telegram.org/bot${TOKEN}/sendMessage`.
Token resolution: `channel_connections.metadata.botToken` first, fallback `process.env.TELEGRAM_BOT_TOKEN` for v1 demo.
Persist outgoing via `insertMessage` with `direction:'outgoing'` so inbox UI shows both sides.
Core never sees Telegram JSON; adapter owns provider specifics (preserves existing seam).

## 4. Data Flow + Reply Rules (Approved)
Extended `POST /api/webhooks/telegram/[connectionId]/route.ts`:
1. Resolve connection via `getChannelConnectionById`, resolve shop/inbox (existing logic unchanged).
2. `adapter.normalizeIncoming`, `upsertContactFromMessage`, `saveIncomingMessage` (unchanged).
3. NEW: if `process.env.AGENT_ENABLED==='true'` and normalized text exists, trigger agent without awaiting (return 200 fast). Agent loads contact history + shop stats, runs runner, decides.
4. If `shouldReply`, call `sendMessage`, save outgoing, log activity `success`. If not, log `stored:true, replied:false`.

Reply:
- Reply to: greetings, pricing, "my order?", "how are sales?", support questions.
- Silent on: duplicates (same `externalMessageId`), non-text, spam, empty.
- Guardrails: 1 reply per incoming, <=300 chars, never invent order IDs/numbers. If tools return empty, reply "let me check with the team and get back to you."
- Kill-switch: `AGENT_ENABLED` env + future per-inbox toggle.

## 5. Error Handling (Approved)
- Webhook always 200. Agent failures logged, never 5xx to Telegram (prevents retry storms).
- LLM timeout 15s, 1 retry, then silent-fail (no reply beats wrong reply).
- Idempotency via existing unique `externalMessageId`.
- Secrets server-only: `TELEGRAM_BOT_TOKEN`, `OPENCODE_ZEN_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Never import server client in client components.
- Validate Telegram secret header if configured. Throttle: max 5 LLM calls/min per contact (in-memory v1).
- Failures write `activity` row `status:'error'` for visibility in existing feed.

## 6. Testing + Ship (Approved)
- Unit: existing `normalizeTelegramUpdate` tests keep passing; add tests for `tools.ts` Zod parsing and `runner.shouldReply` gating.
- Typecheck: `pnpm --filter @workspace/revora typecheck` green. Lint new files to existing style (no new patterns).
- Manual demo (impress script):
  1. Set `.env.local`: `AGENT_ENABLED=true`, tokens.
  2. `pnpm dev`, expose with ngrok, `setWebhook` to `/api/webhooks/telegram/<connectionId>`.
  3. Send "hi, how are sales today?" from Telegram -> expect 2-3s reply with real counts from Supabase.
- New deps only: `ai`, `openai`, `@ai-sdk/openai`. No Python, no FastAPI, no Pydantic duplication.

## 7. Non-Goals (YAGNI)
- No Python service, no LangGraph, no vector DB in v1 (Supabase LIKE/ordering is enough).
- No WhatsApp/Instagram agent yet — Telegram proves pattern, others reuse `ChannelAdapter`.
- No autonomous writes, no training custom models, no dashboard builder in v1.
- No per-inbox admin UI in v1 (env flag only).

## 8. Open Future
- Hybrid later only if needed: TS orchestrator + Python worker for pandas forecasting/churn ML.
- Add embeddings/pgvector search, per-inbox on/off toggle, streaming co-pilot UI in Revora web (Vercel AI SDK `useChat`).
