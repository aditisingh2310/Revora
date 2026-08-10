import { describe, it, expect } from 'vitest';
import { normalizeTelegramUpdate } from '../src/channels/telegram/adapter.js';
import { normalizedMessageSchema } from '../src/types/messages.js';

const ctx = { shopId: '11111111-1111-1111-1111-111111111111', channelConnectionId: '22222222-2222-2222-2222-222222222222' };

const textUpdate = {
  update_id: 12345,
  message: {
    message_id: 99,
    from: {
      id: 777,
      is_bot: false,
      first_name: 'Ada',
      last_name: 'Lovelace',
      username: 'ada_l',
    },
    chat: { id: 777, type: 'private' },
    date: 1700000000,
    text: 'hello',
  },
};

describe('normalizeTelegramUpdate — Test 1: normalization', () => {
  it('converts a Telegram text update into a valid NormalizedMessage', () => {
    const result = normalizeTelegramUpdate(textUpdate, ctx);

    expect(result).not.toBeNull();
    // Must satisfy the universal schema.
    expect(() => normalizedMessageSchema.parse(result)).not.toThrow();

    expect(result).toMatchObject({
      shopId: ctx.shopId,
      channel: 'telegram',
      channelConnectionId: ctx.channelConnectionId,
      externalMessageId: '99',
      externalUserId: '777',
      text: 'hello',
      direction: 'incoming',
      messageType: 'text',
      senderName: 'Ada Lovelace',
    });
    expect(result!.timestamp).toEqual(new Date(1700000000 * 1000));
    expect(result!.metadata).toMatchObject({
      telegramUserId: 777,
      telegramChatId: 777,
      telegramUsername: 'ada_l',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });

  it('builds senderName from first name only when last name is absent', () => {
    const update = {
      message: {
        message_id: 1,
        from: { id: 5, first_name: 'Grace' },
        chat: { id: 5 },
        date: 1700000000,
        text: 'hi',
      },
    };
    const result = normalizeTelegramUpdate(update, ctx);
    expect(result!.senderName).toBe('Grace');
    expect(result!.externalUserId).toBe('5');
  });
});

describe('normalizeTelegramUpdate — Test 6: unsupported updates', () => {
  it('returns null for a non-message update (callback_query)', () => {
    const update = { update_id: 1, callback_query: { id: 'x', from: { id: 1 }, data: 'y' } };
    expect(normalizeTelegramUpdate(update, ctx)).toBeNull();
  });

  it('returns null for an edited_message update', () => {
    const update = { update_id: 1, edited_message: { message_id: 2, from: { id: 1 }, chat: { id: 1 }, date: 1, text: 'x' } };
    expect(normalizeTelegramUpdate(update, ctx)).toBeNull();
  });

  it('returns null for a message without text (e.g. a photo)', () => {
    const update = {
      update_id: 1,
      message: { message_id: 3, from: { id: 1, first_name: 'A' }, chat: { id: 1 }, date: 1, photo: [] },
    };
    expect(normalizeTelegramUpdate(update, ctx)).toBeNull();
  });

  it('returns null for a message with no sender', () => {
    const update = { update_id: 1, message: { message_id: 4, chat: { id: 1 }, date: 1, text: 'x' } };
    expect(normalizeTelegramUpdate(update, ctx)).toBeNull();
  });

  it('returns null for completely malformed payloads', () => {
    expect(normalizeTelegramUpdate(null, ctx)).toBeNull();
    expect(normalizeTelegramUpdate('not-an-object', ctx)).toBeNull();
    expect(normalizeTelegramUpdate(42, ctx)).toBeNull();
  });
});
