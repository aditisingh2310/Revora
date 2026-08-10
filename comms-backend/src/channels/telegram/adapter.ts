import { z } from 'zod';
import { normalizedMessageSchema, type NormalizedMessage } from '../../types/messages.js';
import type { ChannelContext } from '../types.js';
import { telegramUpdateSchema } from './schemas.js';

// The Telegram adapter ONLY translates Telegram-specific data into our
// universal NormalizedMessage. It performs no database work and never decides
// the shop/tenant — that context is supplied by the caller from our own DB.
export function normalizeTelegramUpdate(
  raw: unknown,
  ctx: ChannelContext,
): NormalizedMessage | null {
  const parsed = telegramUpdateSchema.safeParse(raw);
  if (!parsed.success) return null;

  const message = parsed.data.message;
  // Unsupported update type (callback_query, edited_message, ...). Safe no-op.
  if (!message) return null;

  const from = message.from;
  // Can't attribute a message without a sender.
  if (!from) return null;

  // Phase 1 only supports plain text messages.
  if (!message.text) return null;

  const firstName = from.first_name ?? '';
  const lastName = from.last_name ?? '';
  const senderName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;

  const normalized = {
    shopId: ctx.shopId,
    channel: 'telegram',
    channelConnectionId: ctx.channelConnectionId,
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
