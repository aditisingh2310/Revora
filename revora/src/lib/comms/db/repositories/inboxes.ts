import type { SupabaseClient } from '@supabase/supabase-js';
import type { InboxRow } from '../types';

export interface CreateInboxInput {
  shopId: string;
  name: string;
  channelType: string;
  status?: string;
  config?: Record<string, unknown>;
}

export async function getInboxById(
  client: SupabaseClient,
  inboxId: string,
): Promise<InboxRow | null> {
  const { data, error } = await client
    .from('inboxes')
    .select('*')
    .eq('id', inboxId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load inbox: ${error.message}`);
  return (data as InboxRow | null) ?? null;
}

export async function getInboxesByShop(
  client: SupabaseClient,
  shopId: string,
): Promise<InboxRow[]> {
  const { data, error } = await client
    .from('inboxes')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`Failed to list inboxes: ${error.message}`);
  return (data as InboxRow[] | null) ?? [];
}

export async function createInbox(
  client: SupabaseClient,
  input: CreateInboxInput,
): Promise<InboxRow> {
  const row = {
    shop_id: input.shopId,
    name: input.name,
    channel_type: input.channelType,
    status: input.status ?? 'active',
    config: input.config ?? {},
  };

  const { data, error } = await client
    .from('inboxes')
    .insert(row)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create inbox: ${error.message}`);
  return data as InboxRow;
}
