-- Revora comms backend — Phase 2 schema
-- Introduces the Inbox concept: a configured communication endpoint for a shop.
-- A shop owns inboxes; an inbox owns exactly one channel_connection. Existing
-- data is preserved and backfilled by the DO block below (no rows are dropped).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- inboxes: the primary conceptual object for a communication endpoint.
-- The channel_connection is the provider binding/credential beneath it.
-- ---------------------------------------------------------------------------
create table if not exists inboxes (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references shops(id) on delete cascade,
  name         text not null,
  channel_type text not null,
  status       text not null default 'active',
  config       jsonb default '{}'::jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_inboxes_shop on inboxes(shop_id);

-- ---------------------------------------------------------------------------
-- channel_connections gains inbox_id (nullable for a safe, reversible backfill).
-- We KEEP shop_id on channel_connections for backward compatibility; the inbox
-- is the preferred resolution path, but the denormalized shop_id stays harmless.
-- ---------------------------------------------------------------------------
alter table channel_connections
  add column if not exists inbox_id uuid references inboxes(id) on delete cascade;
create index if not exists idx_channel_connections_inbox on channel_connections(inbox_id);

-- contacts + messages gain inbox_id so records stay tied to their inbox.
alter table contacts
  add column if not exists inbox_id uuid references inboxes(id) on delete set null;
create index if not exists idx_contacts_inbox on contacts(inbox_id);

alter table messages
  add column if not exists inbox_id uuid references inboxes(id) on delete set null;
create index if not exists idx_messages_inbox on messages(inbox_id);

-- ---------------------------------------------------------------------------
-- Backfill: create one inbox per existing channel_connection and link them.
-- Idempotent — only connections without an inbox are processed, so re-running
-- this migration never creates duplicate inboxes.
-- ---------------------------------------------------------------------------
do $$
declare
  conn record;
  new_inbox_id uuid;
begin
  for conn in
    select * from channel_connections where inbox_id is null and shop_id is not null
  loop
    insert into inboxes (shop_id, name, channel_type, status, config, created_at, updated_at)
    values (
      conn.shop_id,
      initcap(conn.channel_type),
      conn.channel_type,
      'active',
      conn.config,
      conn.created_at,
      now()
    )
    returning id into new_inbox_id;

    update channel_connections set inbox_id = new_inbox_id where id = conn.id;
  end loop;
end $$;

-- Backfill inbox_id on historical contacts + messages from their connection.
update contacts c
  set inbox_id = cc.inbox_id
  from channel_connections cc
  where c.channel_connection_id = cc.id
    and cc.inbox_id is not null
    and c.inbox_id is null;

update messages m
  set inbox_id = cc.inbox_id
  from channel_connections cc
  where m.channel_connection_id = cc.id
    and cc.inbox_id is not null
    and m.inbox_id is null;
