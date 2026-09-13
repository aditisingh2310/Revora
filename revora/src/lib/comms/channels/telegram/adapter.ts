import { z } from 'zod';
import { normalizedMessageSchema, type NormalizedMessage } from '../../types/messages';
import type { ChannelAdapter, OutgoingMessage, SendResult } from '../adapter';
import type { AdapterContext } from '../types';
import { telegramUpdateSchema } from './schemas';

// Extra context needed for outbound sends. The bot token comes from the caller
// (resolved from our own connection store) or the environment; fetchImpl is an
// injectable fetch for unit tests.
export type SendContext = AdapterContext & {
  botToken?: string;
  fetchImpl?: typeof fetch;
};

export async function sendTelegramMessage(
  message: OutgoingMessage,
  context: SendContext,
): Promise<SendResult> {
  const token = context.botToken ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: 'missing_bot_token' };
  }

  const fetchFn = context.fetchImpl ?? fetch;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  let res: Response;
  try {
    res = await fetchFn(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.to,
        text: message.text.slice(0, 4096),
      }),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'fetch_failed' };
  }

  if (!res.ok) {
    return { ok: false, error: `telegram_http_${res.status}` };
  }

  const data = (await res.json()) as {
    ok: boolean;
    result?: { message_id?: number };
    description?: string;
  };
  if (!data.ok) {
    return { ok: false, error: data.description ?? 'telegram_api_not_ok' };
  }
  if (data.result?.message_id == null) {
    return { ok: false, error: 'telegram_missing_message_id' };
  }
  return { ok: true, externalMessageId: String(data.result.message_id) };
}

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

  async sendMessage(
    message: OutgoingMessage,
    context: SendContext,
  ): Promise<SendResult> {
    return sendTelegramMessage(message, context);
  }
}

// Backward-compatible named export kept for the existing unit-test suite, which
// calls normalizeTelegramUpdate(raw, ctx) directly.
export function normalizeTelegramUpdate(
  raw: unknown,
  ctx: AdapterContext,
): NormalizedMessage | null {
  return TelegramNormalizer.normalize(raw, ctx);
}
