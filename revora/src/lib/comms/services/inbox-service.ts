import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createInbox as repoCreateInbox,
  getInboxById as repoGetInboxById,
  getInboxesByShop as repoGetInboxesByShop,
  type CreateInboxInput,
} from '../db/repositories/inboxes';
import type { InboxRow } from '../db/types';

// Thin service layer over the inbox repository. Exists as a clean seam so future
// phases (provisioning an inbox that also creates its channel_connection, etc.)
// have a single place to put inbox-related orchestration without touching routes.

export async function createInbox(
  client: SupabaseClient,
  input: CreateInboxInput,
): Promise<InboxRow> {
  return repoCreateInbox(client, input);
}

export async function getInboxById(
  client: SupabaseClient,
  inboxId: string,
): Promise<InboxRow | null> {
  return repoGetInboxById(client, inboxId);
}

export async function getInboxesByShop(
  client: SupabaseClient,
  shopId: string,
): Promise<InboxRow[]> {
  return repoGetInboxesByShop(client, shopId);
}
