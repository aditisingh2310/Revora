import type { SupabaseClient } from '@supabase/supabase-js';
import { insertMessage } from '../db/repositories/messages';
import type { MessageRow } from '../db/types';
import type { NormalizedMessage } from '../types/messages';

// Persists a normalized incoming message. Idempotent: duplicate webhook
// deliveries resolve to the same stored row via the DB unique constraint.
export async function saveIncomingMessage(
  client: SupabaseClient,
  message: NormalizedMessage,
  contactId: string,
): Promise<MessageRow> {
  return insertMessage(client, {
    shopId: message.shopId,
    inboxId: message.inboxId ?? null,
    contactId,
    channelConnectionId: message.channelConnectionId,
    externalMessageId: message.externalMessageId,
    channel: message.channel,
    direction: message.direction,
    messageType: message.messageType,
    text: message.text,
    metadata: message.metadata,
    timestamp: message.timestamp,
  });
}
