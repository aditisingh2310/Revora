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
![Express](https://img.shields.io/badge/Express-5-259DFF)

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

Revora is a **pnpm workspace monorepo** with three layers: a Next.js web app,
an Express API server, and a set of shared workspace libraries.

```
                          ┌─────────────────────────────┐
                          │         Client (browser)     │
                          │      Next.js 15  (revora)     │
                          │  /connections · /imports ·    │
                          │     /providers · /activity    │
                          └───────────────┬───────────────┘
                                          │  REST (fetch + React Query)
                                          ▼
                          ┌─────────────────────────────┐
                          │      Express 5 API Server    │
                          │        (@workspace/api-server)│
                          │  /api/health                 │
                          │  /api/connections            │
                          │  /api/imports                │
                          │  /api/activity               │
                          │  /api/webhooks  ── verify ──► │
                          └──────┬───────────┬───────────┘
                                 │           │
              ┌──────────────────┘           └──────────────────┐
              ▼                                                 ▼
   ┌──────────────────────┐                        ┌──────────────────────┐
   │  Shared libraries    │                        │  Provider webhooks   │
   │  @workspace/db       │                        │  (Instagram, WA,     │
   │  @workspace/api-zod  │                        │   Shopify, WC ...)   │
   │  @workspace/         │                        │  RevenueNormalizer   │
   │   api-client-react   │                        └──────────┬───────────┘
   └──────────┬───────────┘                                   │
              │                                                │
              ▼                                                ▼
   ┌──────────────────────┐                        ┌──────────────────────┐
   │  SQLite (node:sqlite)│ ◄───────────────────── │  Normalized revenue  │
   │  Drizzle ORM         │      connection-events │  + connection events │
   └──────────────────────┘                        └──────────────────────┘
```

### Workspace packages

| Package | Purpose |
| --- | --- |
| `revora/` | Next.js 15 web app (UI, onboarding, dashboards) |
| `api-server/` | Express 5 REST API; routes + webhook ingestion |
| `lib/db/` | Drizzle schema, SQLite access, provider catalog |
| `lib/api-zod/` | Shared Zod request/response schemas |
| `lib/api-client-react/` | Typed React Query client for the frontend |
| `scripts/` | Workspace tooling |

### Data flow

1. A **provider webhook** arrives at `/api/webhooks`.
2. A `ProviderWebhookVerifier` checks the signature — unconfigured providers
   fail closed (`UnconfiguredWebhookVerifier` always returns `false`).
3. The verified event is passed to a `RevenueNormalizer` and stored as a
   **connection event** in SQLite.
4. The web app reads normalized revenue + connection data through the API and
   renders it in the connections overview and activity views.

---

## 🚀 Getting started

> Requires **Node.js** and **pnpm**. The workspace rejects installs from other
> package managers on purpose.

```bash
# 1. install dependencies
pnpm install

# 2. run the web app + api in dev
pnpm dev          # → web app (Next.js)
                 # → api server (Express)

# 3. build everything
pnpm build

# 4. typecheck
pnpm typecheck
```

The web app redirects from `/` to `/connections` on boot.

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
