import { z } from 'zod';
import { normalizedMessageSchema, type NormalizedMessage } from '../../types/messages';
import type { ChannelAdapter } from '../adapter';
import type { AdapterContext } from '../types';
import { telegramUpdateSchema } from './schemas';

// The Telegram adapter ONLY translates Telegram-specific data into our universal
// NormalizedMessage. It performs no database work and never decides the shop or
// inbox — that context is supplied by the caller (the webhook route) from our
// own database. This keeps all Telegram-specific knowledge inside this file.
class TelegramNormalizer {
  static normalize(raw: unknown, context: AdapterContext): NormalizedMessage | null {
    const parsed = telegramUpdateSchema.safeParse(raw);
    if (!parsed.success) return null;

    const message = parsed.data.message;
    // Unsupported update type (callback_query, edited_message, ...). Safe no-op.
    if (!message) return null;

    const from = message.from;
    // Can't attribute a message without a sender.
    if (!from) return null;

    // Phase 2 only supports plain text messages.
    if (!message.text) return null;

    const firstName = from.first_name ?? '';
    const lastName = from.last_name ?? '';
    const senderName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;

    const normalized = {
      shopId: context.shopId,
      inboxId: context.inboxId ?? null,
      channel: 'telegram' as const,
      channelConnectionId: context.channelConnectionId,
      externalMessageId: String(message.message_id),
      externalUserId: String(from.id),
      text: message.text,
      direction: 'incoming' as const,
      messageType: 'text',
      senderName,
      metadata: {
        telegramUserId: from.id,
        telegramChatId: message.chat.id,
        telegramUsername: from.username ?? null,
        firstName: from.first_name ?? null,
        lastName: from.last_name ?? null,
      },
      timestamp: new Date(message.date * 1000),
    };

    // Validate the produced shape against the universal model.
    return normalizedMessageSchema.parse(normalized);
  }
}

export class TelegramAdapter implements ChannelAdapter {
  readonly type = 'telegram';

  async normalizeIncoming(
    event: unknown,
    context: AdapterContext,
  ): Promise<NormalizedMessage | null> {
    return TelegramNormalizer.normalize(event, context);
  }

  // sendMessage is intentionally NOT implemented in Phase 2 — outbound messaging
  // is out of scope. The interface declares it as optional, so omitting it here
  // is correct, not a gap.
}

// Backward-compatible named export kept for the existing unit-test suite, which
// calls normalizeTelegramUpdate(raw, ctx) directly.
export function normalizeTelegramUpdate(
  raw: unknown,
  ctx: AdapterContext,
): NormalizedMessage | null {
  return TelegramNormalizer.normalize(raw, ctx);
}
