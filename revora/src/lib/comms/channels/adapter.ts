import type { NormalizedMessage } from '../types/messages';
import type { AdapterContext } from './types';

// An outbound message destined for a specific external user on a channel.
// Declared so the interface can represent outbound support, but it is NOT
// implemented in Phase 2 — outbound sending is intentionally left for later.
export interface OutgoingMessage {
  to: string; // external user id on the channel (e.g. Telegram user id)
  text: string;
  // attachments, reply-to, etc. reserved for future phases
}

export interface SendResult {
  ok: boolean;
  externalMessageId?: string;
  error?: string;
}

// Provider-independent channel contract. The core application depends ONLY on
// this interface and on NormalizedMessage — never on any provider's JSON shape.
// Each channel (Telegram, WhatsApp, Web, ...) supplies its own implementation
// that owns all provider-specific interpretation.
export interface ChannelAdapter {
  // Stable channel identifier, e.g. "telegram". Used for routing/logging.
  readonly type: string;

  // Translate a raw provider event into our universal NormalizedMessage.
  // Returns null for events this adapter cannot/should not handle.
  // Must stay DB-free: tenant/inbox attribution comes from `context`, never the payload.
  normalizeIncoming(
    event: unknown,
    context: AdapterContext,
  ): Promise<NormalizedMessage | null>;

  // Outbound support is represented but intentionally unimplemented in Phase 2.
  sendMessage?(message: OutgoingMessage, context: AdapterContext): Promise<SendResult>;
}
