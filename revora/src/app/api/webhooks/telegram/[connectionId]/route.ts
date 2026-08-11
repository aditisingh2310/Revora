import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/comms/db/supabase";
import { getChannelConnectionById } from "@/lib/comms/db/repositories/channels";
import { getInboxById } from "@/lib/comms/db/repositories/inboxes";
import { TelegramAdapter } from "@/lib/comms/channels/telegram/adapter";
import { upsertContactFromMessage } from "@/lib/comms/services/contact-service";
import { saveIncomingMessage } from "@/lib/comms/services/message-service";

export const dynamic = "force-dynamic";

// One adapter instance for the process. It is DB-free and safe to reuse.
const telegramAdapter = new TelegramAdapter();

interface RouteContext {
  params: Promise<{ connectionId: string }>;
}

// POST /api/webhooks/telegram/:connectionId
//
// Layer responsibilities:
//   1. HTTP + routing (this file): authenticate the connection, resolve the
//      owning inbox + shop, then delegate.
//   2. Telegram adapter: interpret the Telegram-specific payload. The core never
//      sees Telegram JSON.
//   3. Core services: contacts/messages/database logic, channel-agnostic.
//
// Always responds 200 so Telegram does not retry indefinitely; failures are
// logged, not surfaced as 5xx.
export async function POST(_request: Request, { params }: RouteContext) {
  const { connectionId } = await params;
  const client = createSupabaseClient();

  // No Supabase configured (or env missing) — acknowledge without persisting.
  if (!client) {
    console.error("Supabase client not configured; cannot persist Telegram message");
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const connection = await getChannelConnectionById(client, connectionId);
    if (!connection || !connection.id) {
      console.warn({ connectionId }, "Unknown channel connection");
      return NextResponse.json({ ok: true, stored: false });
    }

    // Resolve the owning inbox (preferred) and shop. In Phase 2 every
    // connection is linked to an inbox; the shop_id fallback preserves
    // behaviour for any legacy row that has not been backfilled yet.
    let shopId: string | null = connection.shop_id ?? null;
    let inboxId: string | null = null;
    if (connection.inbox_id) {
      const inbox = await getInboxById(client, connection.inbox_id);
      if (inbox) {
        shopId = inbox.shop_id;
        inboxId = inbox.id;
      }
    }
    if (!shopId) {
      console.warn({ connectionId }, "Connection has no resolvable shop");
      return NextResponse.json({ ok: true, stored: false });
    }

    // shop/inbox ids come from OUR database, never from the Telegram payload.
    const body = await _request.json().catch(() => ({}));
    const normalized = await telegramAdapter.normalizeIncoming(body, {
      shopId,
      inboxId,
      channelConnectionId: connection.id,
    });

    // Unsupported / non-text update: acknowledge and move on.
    if (!normalized) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const contact = await upsertContactFromMessage(client, normalized);
    await saveIncomingMessage(client, normalized, contact.id);

    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("Error handling Telegram webhook", err);
    return NextResponse.json({ ok: true, stored: false });
  }
}
