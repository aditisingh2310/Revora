# ⚡ Revora

> One brain, many doors — unify revenue and customer data from every channel in one place.

**Revora** is a revenue intelligence workspace that pulls customers, orders, and
activity from all your channels (Instagram, WhatsApp, Website, Shopify,
WooCommerce, CSV, and manual entry) into a single, queryable view. A guided
onboarding flow, a live connections overview, and a webhook ingestion pipeline
keep everything in sync.

![Revora](https://img.shields.io/badge/Revora-revenue--workspace-blueviolet)
![pnpm](https://img.shields.io/badge/package%20manager-pnpm-F69220)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E)

---

## ✨ Features

- 🔌 **Multi-channel connections** — Instagram, WhatsApp, Website, Shopify,
  WooCommerce, CSV import, and manual entry, all behind one catalog.
- 📥 **CSV & manual import** — a guided mapping wizard plus a manual record
  entry form for data you're not ready to connect yet.
- 🪝 **Webhook ingestion** — pluggable, signature-verified provider webhooks
  with a normalized revenue event model. A webhook never reports success
  before it is verified and queued.
- 📊 **Revenue analytics** — normalized revenue data with charts and a
  connections overview dashboard.
- 🏢 **Tenant-aware** — every query is scoped by tenant so workspaces stay isolated.
- 🔒 **Supply-chain hardened** — pnpm enforces a 1-day minimum release age on
  new packages to blunt supply-chain attacks.

---

## 🧱 Architecture

Revora is a **pnpm workspace monorepo** with a single full-stack app. `revora/`
is both the UI and the backend: Next.js App Router **pages** render the product,
and Next.js **route handlers** (`app/api/*`) are the only API server. All data
lives in **one Supabase (Postgres) project** — the former local SQLite store and
the Telegram/comms tables are now unified there.

```
                          ┌─────────────────────────────┐
                          │      Browser (Revora UI)     │
                          │  /connections · /import/* ·  │
                          │     /onboarding · /activity  │
                          └───────────────┬───────────────┘
                                          │  fetch + React Query
                                          ▼
                          ┌─────────────────────────────┐
                          │   Next.js 15 (revora)         │
                          │   app/  (pages)               │
                          │   app/api/  (route handlers)  │
                          │     /api/connections          │
                          │     /api/imports              │
                          │     /api/activity             │
                          │     /api/webhooks/telegram/*  │
                          │   lib/comms/  (Telegram adapter│
                          │     + inbox/contact/message   │
                          │     services & repositories)  │
                          └───────────────┬───────────────┘
                                          │  @supabase/supabase-js
                                          ▼
                          ┌─────────────────────────────┐
                          │   ONE Supabase (Postgres)    │
                          │   organizations, connections,│
                          │   customers, orders,         │
                          │   sync_jobs, connection_events│
                          │   shops, inboxes,            │
                          │   channel_connections,       │
                          │   contacts, messages         │
                          └─────────────────────────────┘
```

### Workspace packages

| Package | Purpose |
| --- | --- |
| `revora/` | Next.js 15 full-stack app — UI **and** the single API backend (route handlers) |
| `revora/src/lib/comms/` | Channel-adapter abstraction, Telegram adapter, inbox/contact/message services & repositories |
| `revora/supabase/migrations/` | SQL migrations for the unified Supabase schema |
| `lib/api-zod/` | Shared Zod request/response schemas |
| `lib/api-client-react/` | Typed React Query client for the frontend |
| `scripts/` | Workspace tooling |

### Data flow

1. A **provider webhook** (e.g. `POST /api/webhooks/telegram/:connectionId`)
   arrives. The Telegram adapter translates the raw payload into the universal
   `NormalizedMessage` — the core never sees Telegram JSON.
2. The route resolves `channel_connection → inbox → shop` from **our** database
   (never the payload) and upserts a contact, then stores the message
   idempotently (unique constraint on `channel_connection_id,
   external_message_id`).
3. Revenue imports (manual / CSV) write `customers` + `orders` rows.
4. The web app reads normalized data through the API and renders the
   connections overview and activity views.

Retired: the old `api-server` (Express), `mockup-sandbox`, and `lib/db` (SQLite)
were folded into `revora` and the Supabase-backed data layer.

---

## 🚀 Getting started

> Requires **Node.js** and **pnpm**. The workspace rejects installs from other
> package managers on purpose.

```bash
# 1. install dependencies
pnpm install

# 2. run the full-stack app in dev (UI + API routes in one process)
pnpm dev          # → Next.js (UI + API route handlers)

# 3. build everything
pnpm build

# 4. typecheck
pnpm typecheck
```

The app requires a Supabase project. Copy `revora/.env.local` (or set
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) and apply the migrations in
`revora/supabase/migrations` to that project. The web app redirects from `/` to
`/connections` on boot.

---

## 🧰 Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the Revora web app in development |
| `pnpm build` | Typecheck then build all packages |
| `pnpm start` | Start the production web server |
| `pnpm typecheck` | Typecheck libs, web app, and scripts |

---

## 🔐 Security notes

- **Supply-chain defense:** `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`,
  requiring packages to be published ≥ 1 day before install. Keep it on.
- **Webhook integrity:** webhooks are rejected until a real signature verifier
  is configured. Never report success before verify + queue.

---

## 📄 License

MIT
