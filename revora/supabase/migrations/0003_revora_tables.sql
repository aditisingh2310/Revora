-- Revora app data — migrated from the local SQLite store (@workspace/db) that
-- the Next.js full-stack app used to use. These tables hold the connection /
-- revenue / sync data that previously lived in a file-backed SQLite database.
-- They are created in the SAME Supabase project as the comms tables
-- (shops, inboxes, channel_connections, contacts, messages from 0001/0002),
-- so the whole app now shares one database.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- organizations: a Revora workspace / tenant.
-- ---------------------------------------------------------------------------
create table if not exists organizations (
  id         uuid primary key,
  name       text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- connections: a workspace's connection to an external provider
-- (instagram, whatsapp, website, shopify, woocommerce, csv, manual).
-- ---------------------------------------------------------------------------
create table if not exists connections (
  id                     uuid primary key default gen_random_uuid(),
  organization_id        uuid not null references organizations(id) on delete cascade,
  provider               text not null,
  status                 text not null default 'NOT_CONNECTED',
  external_account_id    text,
  external_account_name  text,
  configuration          jsonb default '{}'::jsonb,
  connected_at           timestamptz,
  last_sync_at           timestamptz,
  last_success_at        timestamptz,
  last_error             text,
  webhook_status         text default 'NOT_CONFIGURED',
  created_at             timestamptz default now(),
  updated_at             timestamptz default now(),
  unique (organization_id, provider)
);
create index if not exists idx_connections_org on connections(organization_id);
create index if not exists idx_connections_provider on connections(provider);

-- ---------------------------------------------------------------------------
-- connection_events: raw events received from a provider connection.
-- ---------------------------------------------------------------------------
create table if not exists connection_events (
  id               uuid primary key default gen_random_uuid(),
  connection_id    uuid not null references connections(id) on delete cascade,
  provider_event_id text,
  event_type       text not null,
  payload          text,
  created_at       timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- sync_jobs: a synchronization run for a connection.
-- ---------------------------------------------------------------------------
create table if not exists sync_jobs (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  connection_id     uuid not null references connections(id) on delete cascade,
  status            text not null,
  started_at        timestamptz,
  completed_at      timestamptz,
  error             text,
  records_processed integer default 0,
  created_at        timestamptz default now()
);
create index if not exists idx_sync_jobs_org on sync_jobs(organization_id);

-- ---------------------------------------------------------------------------
-- customers: a customer imported from/attributed to a connection.
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  external_source text default 'manual',
  external_id     text,
  name            text not null,
  phone           text,
  email           text,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_customers_org on customers(organization_id);

-- ---------------------------------------------------------------------------
-- orders: a revenue record tied to a customer.
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id     uuid not null references customers(id) on delete cascade,
  external_source text default 'manual',
  external_id     text,
  product         text not null,
  order_value     numeric not null,
  channel         text,
  order_date      text not null,
  status          text not null default 'paid',
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_orders_org on orders(organization_id);
create index if not exists idx_orders_customer on orders(customer_id);
