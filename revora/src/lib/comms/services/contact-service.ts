import type { SupabaseClient } from '@supabase/supabase-js';
import { findOrCreateContact } from '../db/repositories/contacts';
import type { ContactRow } from '../db/types';
import type { NormalizedMessage } from '../types/messages';

// Turns a normalized message into (or finds) the corresponding contact.
// Identity is the channel's external user id within this connection.
export async function upsertContactFromMessage(
  client: SupabaseClient,
  message: NormalizedMessage,
): Promise<ContactRow> {
  const username =
    typeof message.metadata.telegramUsername === 'string'
      ? message.metadata.telegramUsername
      : null;

  return findOrCreateContact(client, {
    shopId: message.shopId,
    inboxId: message.inboxId ?? null,
    channelConnectionId: message.channelConnectionId,
    externalId: message.externalUserId,
    name: message.senderName,
    username,
  });
}
