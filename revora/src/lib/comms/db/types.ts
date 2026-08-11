// Row shapes as stored in Supabase Postgres. These mirror the migrations in
// supabase/migrations/0001_init.sql and 0002_inboxes.sql.

export interface ShopRow {
  id: string;
  name: string;
  created_at: string;
}

export interface InboxRow {
  id: string;
  shop_id: string;
  name: string;
  channel_type: string;
  status: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChannelConnectionRow {
  id: string;
  shop_id: string | null;
  inbox_id: string | null;
  channel_type: string;
  external_account_id: string;
  config: Record<string, unknown>;
  created_at: string;
}

export interface ContactRow {
  id: string;
  shop_id: string | null;
  inbox_id: string | null;
  channel_connection_id: string | null;
  external_id: string;
  name: string | null;
  username: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  shop_id: string | null;
  inbox_id: string | null;
  contact_id: string | null;
  channel_connection_id: string | null;
  channel: string;
  external_message_id: string;
  direction: string;
  message_type: string;
  text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
