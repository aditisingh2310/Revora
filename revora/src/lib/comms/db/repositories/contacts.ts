import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContactRow } from '../types';

export interface FindOrCreateContactInput {
  shopId: string;
  inboxId?: string | null;
  channelConnectionId: string;
  externalId: string;
  name?: string | null;
  username?: string | null;
  metadata?: Record<string, unknown>;
}

// Idempotent: returns the existing contact when one already exists for the
// (shop, channel_connection, external_id) triple, otherwise creates it.
export async function findOrCreateContact(
  client: SupabaseClient,
  input: FindOrCreateContactInput,
): Promise<ContactRow> {
  const { data: existing, error: selectError } = await client
    .from('contacts')
    .select('*')
    .eq('shop_id', input.shopId)
    .eq('channel_connection_id', input.channelConnectionId)
    .eq('external_id', input.externalId)
    .maybeSingle();
  if (selectError) throw new Error(`Failed to find contact: ${selectError.message}`);
  if (existing) return existing as ContactRow;

  const row = {
    shop_id: input.shopId,
    inbox_id: input.inboxId ?? null,
    channel_connection_id: input.channelConnectionId,
    external_id: input.externalId,
    name: input.name ?? null,
    username: input.username ?? null,
    metadata: input.metadata ?? {},
  };

  const { data: inserted, error: insertError } = await client
    .from('contacts')
    .insert(row)
    .select('*')
    .single();

  if (insertError) {
    // Unique violation -> a concurrent insert won the race. Re-fetch it.
    if (insertError.code === '23505') {
      const { data: again } = await client
        .from('contacts')
        .select('*')
        .eq('shop_id', input.shopId)
        .eq('channel_connection_id', input.channelConnectionId)
        .eq('external_id', input.externalId)
        .maybeSingle();
      if (again) return again as ContactRow;
    }
    throw new Error(`Failed to create contact: ${insertError.message}`);
  }

  return inserted as ContactRow;
}
