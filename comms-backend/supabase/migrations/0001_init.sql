-- Revora comms backend — Phase 1 schema
-- Telegram -> normalized messages, multi-tenant.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- shops: a shop owner / tenant
-- ---------------------------------------------------------------------------
create table if not exists shops (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- channel_connections: a shop's connection to a messaging channel.
-- For Telegram: channel_type = 'telegram', external_account_id = Telegram bot id.
-- Secrets (bot tokens) are NOT stored here — they come from env / secret store.
-- ---------------------------------------------------------------------------
create table if not exists channel_connections (
  id                  uuid primary key default gen_random_uuid(),
  shop_id             uuid references shops(id) on delete cascade,
  channel_type        text not null,
  external_account_id text not null,
  config              jsonb default '{}'::jsonb,
  created_at          timestamptz default now()
);
create index if not exists idx_channel_connections_shop
  on channel_connections(shop_id);

-- ---------------------------------------------------------------------------
-- contacts: a person we have interacted with on a channel.
-- ---------------------------------------------------------------------------
create table if not exists contacts (
  id                    uuid primary key default gen_random_uuid(),
  shop_id               uuid references shops(id) on delete cascade,
  channel_connection_id uuid references channel_connections(id) on delete cascade,
  external_id           text not null,
  name                  text,
  username              text,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (shop_id, channel_connection_id, external_id)
);
create index if not exists idx_contacts_connection
  on contacts(channel_connection_id);

-- ---------------------------------------------------------------------------
-- messages: normalized, channel-agnostic message records.
-- The unique constraint gives us webhook idempotency: the same incoming
-- Telegram message is never stored twice.
-- ---------------------------------------------------------------------------
create table if not exists messages (
  id                    uuid primary key default gen_random_uuid(),
  shop_id               uuid references shops(id) on delete cascade,
  contact_id            uuid references contacts(id) on delete cascade,
  channel_connection_id uuid references channel_connections(id) on delete cascade,
  channel               text not null,
  external_message_id   text not null,
  direction             text not null check (direction in ('incoming', 'outgoing')),
  message_type          text not null,
  text                  text,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz not null,
  unique (channel_connection_id, external_message_id)
);
create index if not exists idx_messages_connection
  on messages(channel_connection_id);
