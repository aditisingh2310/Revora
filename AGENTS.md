# Revora — Agent Rules (MUST FOLLOW)

## 1. NEVER hardcode agent replies. EVER.

- Every user-visible bot reply MUST come from the LLM via Kilo gateway.
- FORBIDDEN: canned `WELCOME`, `GREETING_REPLY`, `FALLBACK_REPLY` strings,
  `GREETING` regexes, `/start` shortcuts, `SALES_HINT` regexes,
  `shouldUseRevenueTools`-style content gates, or any `if (text === "hi") return "..."`.
- `hi`, `hello`, `hey`, `/start`, `how are sales?` — ALL go through `runAgent()` → LLM.
  The system prompt tells the LLM how to greet / welcome / answer. No bypass.
- The ONLY allowed silent cases (no reply at all) are in `decideReply()`:
  empty text or duplicate `externalMessageId`. Nothing content-based.
- Tests MUST assert the LLM was called (inject a mock `llm` and check it ran).
  Tests that assert canned text (`includes("welcome")` without LLM, `SHOULD-NOT-CALL`)
  are banned — they enforce hardcoding.

## 2. LLM failure policy — retry LLM, never canned text

- If the primary model call throws (bad key, outage, timeout, policy block):
  1. retry once with `AGENT_FALLBACK_MODEL_ID`,
  2. if that also fails → log + stay silent (no reply).
- NEVER send a hardcoded fallback sentence to the user.
  A missing reply + error log beats a fake canned reply every time.
- `handle.ts` must not contain any user-facing string literal.

## 3. Provider: Kilo gateway (free models), OpenAI-compatible

- Base URL: `https://api.kilo.ai/api/gateway`
  Chat endpoint: `POST /chat/completions` (handled by `@ai-sdk/openai` `createOpenAI({ baseURL })`)
  Model list: `GET /models` (no token needed, OpenAI-style collection).
- Auth: `Authorization: Bearer $KILO_API_KEY` → env `KILO_API_KEY`.
  Get a key at [kilo.ai](https://kilo.ai) dashboard → Gateway → API keys.
- Default model: `process.env.AGENT_MODEL ?? "nex-agi/nex-n2.5-mini:free"` (timed ~1s;
  `kilo-auto/free` routes to a pro model at ~25s — fallback only).
  Fallback model: `process.env.AGENT_FALLBACK_MODEL ?? "kilo-auto/free"` (verified live in catalog).
  Other known `:free` IDs (from [models.dev/providers/kilo](https://models.dev/providers/kilo/) and
  [free models](https://kilo.ai/landing/free-models)): `stepfun/step-3.7-flash:free`,
  `poolside/laguna-s-2.1:free`, `nvidia/nemotron-3-ultra-550b-a55b:free`, `openrouter/free`.
  Verify via `GET https://api.kilo.ai/api/gateway/models`.
- Docs: [gateway](https://kilo.ai/docs/gateway),
  [models-and-providers](https://kilo.ai/docs/gateway/models-and-providers),
  [api-reference](https://kilo.ai/docs/gateway/api-reference).
- Env (see `revora/.env.example`): `KILO_API_KEY`, `AGENT_MODEL`, `AGENT_FALLBACK_MODEL`.
  Legacy `OPENCODE_ZEN_API_KEY` / `muse-spark-*` is retired — do not reintroduce it.

## 4. Never undo user changes

- NEVER `git checkout -- <file>`, `git restore`, `git reset --hard`, or rewrite a file
  to discard user edits without their explicit approval.
- If local edits conflict with what you want to do: STOP, show the diff,
  and ask. Approval for one file never extends to others.
- Prefer additive edits. Report what you changed and what you left alone.

## 5. Agent code map

- `revora/src/lib/agent/runner.ts` — brain loop. Gate (empty/duplicate) → LLM + 2 tool steps.
  Exports `KILO_BASE_URL`, `AGENT_MODEL_ID`, `AGENT_FALLBACK_MODEL_ID`, `decideReply`, `runAgent`.
- `revora/src/lib/agent/handle.ts` — Telegram side effects. Throttle → `runAgent` (+1 fallback-model
  retry) → `adapter.sendMessage` → persist outgoing. Always silent on failure, never canned.
- `revora/src/lib/agent/tools.ts` — read-only Supabase tools only
  (`getShopStats`, `searchRecentOrders`, `getRecentMessages`). No regex gates here.
- `revora/src/app/api/webhooks/telegram/[connectionId]/route.ts` — HTTP layer, always 200.
