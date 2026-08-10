# Revora Comms Backend — Phase 1

> **Scope:** Telegram → TypeScript (Fastify) → normalize → Supabase Postgres.
> One stateless backend, many shops. Outgoing messages, AI, CRM, and other
> channels are intentionally **out of scope** for this phase.

This is a multi-tenant ingestion layer inspired by Chatwoot's architecture.
A Telegram webhook arrives, we look up which shop the connection belongs to
(from *our* database — never trusting the payload), normalize the Telegram
event into a universal message model, and persist it in Supabase.

---

## Architecture

```
                 TELEGRAM
                    │  webhook
                    ▼
         POST /webhooks/telegram/:connectionId
                    │
                    ▼
         channel_connections lookup  ──► shop_id (from our DB)
                    │
                    ▼
         Telegram adapter  ──►  NormalizedMessage
                    │
                    ▼
         find/create contact  +  insert message  ──►  Supabase
```

There is **one server for all shops**. A shop is identified by the
`channel_connections` row referenced in the webhook path.

---

## Project structure

```
src/
├── server.ts                 # buildApp() + main() (listens on PORT)
├── config/env.ts             # zod-validated env (secrets never stored in DB)
├── db/
│   ├── supabase.ts           # creates the Supabase client (or null)
│   ├── types.ts              # DB row types
│   └── repositories/         # shops, channels, contacts, messages (SQL only)
├── channels/
│   ├── types.ts              # ChannelContext (shop/connection attribution)
│   └── telegram/
│       ├── adapter.ts        # Telegram Update ──► NormalizedMessage | null
│       ├── schemas.ts        # Zod schemas for the Telegram subset we use
│       └── routes.ts         # POST /webhooks/telegram/:connectionId
├── services/                 # contact-service, message-service
├── routes/health.ts          # GET /health
└── types/messages.ts         # the universal NormalizedMessage model

supabase/migrations/0001_init.sql
tests/                        # adapter, ingestion (idempotency + multi-tenant), health
.env.example
```

---

## Local development

> Prereqs: **Node.js 18+**, **npm**, a **Supabase** project (cloud free tier or
> local via `supabase start`), and a **Telegram bot** from BotFather. For a
> public webhook while developing locally you'll also want an HTTPS tunnel
> (e.g. `ngrok http 3000`).

### 1. Create a Supabase project
- Cloud: sign in at [supabase.com](https://supabase.com), create a project.
- Local: `supabase init && supabase start` (requires Docker).
- Either way, note the **Project URL** and **service role key** (Project
  Settings → API → `service_role`). Keep the service-role key secret.

### 2. Run the SQL migration
Apply `supabase/migrations/0001_init.sql` to your project:
- Cloud: open **SQL Editor** in the dashboard, paste the file, run it.
- Local: `supabase db reset` (applies `supabase/migrations/`), or run it in the
  SQL editor of your local studio at `http://localhost:54323`.

This creates `shops`, `channel_connections`, `contacts`, and `messages`.

### 3. Create a Telegram bot
Message [@BotFather](https://t.me/BotFather), `/newbot`, and copy the
**HTTP API token** (looks like `123456:ABC-DEF...`).

### 4. Create a test shop
Insert a shop row (SQL editor or any Postgres client):

```sql
insert into shops (name) values ('My Test Shop') returning id;
-- copy the returned UUID, e.g. aaaaaaaa-0000-0000-0000-00000000000a
```

### 5. Create a Telegram channel connection
Link the bot to that shop. `external_account_id` is the bot's numeric id
(ask BotFather or read it from the first webhook update you receive). For local
testing you can put any placeholder and update it later.

```sql
insert into channel_connections (shop_id, channel_type, external_account_id)
values ('aaaaaaa-0000-0000-0000-00000000000a', 'telegram', 'YOUR_BOT_ID')
returning id;
-- copy the returned connection UUID, e.g. aaaaaaaa-0000-0000-0000-0000000000aa
```

### 6. Run the server locally
```bash
cd comms-backend
cp .env.example .env
# edit .env: set PORT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN
npm install
npm run dev          # tsx watch src/server.ts
```

> Note: if `PORT=3000` is already taken (e.g. the `revora` Next.js web app in
> this monorepo is running), set `PORT` to something else like `3100` for the
> comms backend. Render assigns its own port at deploy time, so this only
> affects local dev.

### 7. Expose the local webhook over HTTPS
Telegram only calls HTTPS URLs.
```bash
ngrok http 3000
# copy the https://xxxx.ngrok-free.app URL
```

### 8. Register the Telegram webhook
Point Telegram at our route for that connection id:
```bash
curl -F "url=https://xxxx.ngrok-free.app/webhooks/telegram/aaaaaaaa-0000-0000-0000-0000000000aa" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
Telegram will now POST every update to that path.

### 9. Send a Telegram message
Message your bot in Telegram: `hello`.

### 10. Check the message in Supabase
In the Supabase **Table Editor** (or SQL editor):
```sql
select m.text, m.direction, m.channel, m.external_message_id, m.created_at,
       s.name as shop, c.external_id as telegram_user
from messages m
join shops s on s.id = m.shop_id
join contacts c on c.id = m.contact_id
order by m.created_at desc limit 5;
```
You should see your `hello` row with the correct shop, contact, connection,
message id, channel, direction, and timestamp.

---

## Tests

```bash
npm test          # vitest run
npm run typecheck
```

All tests run against an in-memory fake Supabase, so they need **no external
services**. They cover:

- **Normalization** — a Telegram text update becomes a valid `NormalizedMessage`.
- **Ingestion** — `hello` creates 1 contact + 1 message.
- **Idempotency** — the same webhook delivered twice → 1 message (DB unique
  constraint `(channel_connection_id, external_message_id)`).
- **Multiple contacts** — two users → 2 contacts + 2 messages, same shop.
- **Multi-tenant isolation** — messages through Shop A's connection are stored
  under Shop A; Shop B's under Shop B. No cross-tenant data.
- **Unsupported updates** — non-text / non-message updates are acknowledged
  (200) and store nothing.

> To run the exact same flow against a **real** Supabase instance, set
> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and the ingestion tests will
> use it instead of the fake.

---

## Deploy to Render

The app is stateless — all state lives in Supabase.

1. Push this `comms-backend/` directory to a Git repo.
2. In Render, create a **Web Service**, runtime **Node**, and set:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
   - Environment: `PORT` (Render provides it), `SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`.
3. After deploy, register the webhook against your live URL:
   `https://<your-app>.onrender.com/webhooks/telegram/<connectionId>`
   (see step 8 above).

`npm run start` runs `node dist/server.js`, which listens on `process.env.PORT`.

---

## Security notes

- **Secrets stay out of the database.** Bot tokens and the Supabase
  service-role key are read from the environment only.
- The **shop id is never trusted from the Telegram payload** — it is resolved
  from our `channel_connections` row via the webhook path's `:connectionId`.
- The webhook always returns `200` so Telegram does not retry风暴; failures are
  logged, not returned as `5xx`.
- (Optional hardening, not required for Phase 1) Protect the endpoint with
  Telegram's `secret_token` header and verify it in the route.
