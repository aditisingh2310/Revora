import type { SupabaseClient } from '@supabase/supabase-js';
import { findOrCreateContact } from '../db/repositories/contacts.js';
import type { ContactRow } from '../db/types.js';
import type { NormalizedMessage } from '../types/messages.js';

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
    channelConnectionId: message.channelConnectionId,
    externalId: message.externalUserId,
    name: message.senderName,
    username,
  });
}
