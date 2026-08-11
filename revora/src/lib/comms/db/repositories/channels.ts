import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChannelConnectionRow } from '../types';

// The shop_id MUST come from our registered channel_connections row — never
// from the Telegram payload. The webhook path contains our connection UUID.
export async function getChannelConnectionById(
  client: SupabaseClient,
  connectionId: string,
): Promise<ChannelConnectionRow | null> {
  const { data, error } = await client
    .from('channel_connections')
    .select('*')
    .eq('id', connectionId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load channel connection: ${error.message}`);
  return (data as ChannelConnectionRow | null) ?? null;
}
