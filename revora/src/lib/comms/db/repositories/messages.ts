import type { SupabaseClient } from '@supabase/supabase-js';
import type { MessageRow } from '../types';

export interface InsertMessageInput {
  shopId: string;
  inboxId?: string | null;
  contactId: string;
  channelConnectionId: string;
  externalMessageId: string;
  channel: string;
  direction: string;
  messageType: string;
  text: string | null;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

// Idempotent insert. The DB unique constraint on
// (channel_connection_id, external_message_id) guarantees a retried Telegram
// webhook never creates a second row. On a unique violation we return the
// already-stored message instead of erroring.
export async function insertMessage(
  client: SupabaseClient,
  input: InsertMessageInput,
): Promise<MessageRow> {
  const row = {
    shop_id: input.shopId,
    inbox_id: input.inboxId ?? null,
    contact_id: input.contactId,
    channel_connection_id: input.channelConnectionId,
    external_message_id: input.externalMessageId,
    channel: input.channel,
    direction: input.direction,
    message_type: input.messageType,
    text: input.text,
    metadata: input.metadata,
    created_at: input.timestamp.toISOString(),
  };

  const { data, error } = await client
    .from('messages')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await client
        .from('messages')
        .select('*')
        .eq('channel_connection_id', input.channelConnectionId)
        .eq('external_message_id', input.externalMessageId)
        .maybeSingle();
      if (existing) return existing as MessageRow;
    }
    throw new Error(`Failed to insert message: ${error.message}`);
  }

  return data as MessageRow;
}
