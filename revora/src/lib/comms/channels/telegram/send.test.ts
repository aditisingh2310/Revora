import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TelegramAdapter } from './adapter';

describe('TelegramAdapter.sendMessage', () => {
  it('posts to the Bot API and returns the external message id', async () => {
    let calls = 0;
    const fetchImpl = (async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({ ok: true, result: { message_id: 42 } }),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    const adapter = new TelegramAdapter();
    const res = await adapter.sendMessage!(
      { to: '123', text: 'hello' },
      {
        shopId: 'shop_1',
        channelConnectionId: 'conn_1',
        botToken: 'test-token',
        fetchImpl,
      },
    );

    assert.equal(res.ok, true);
    assert.equal(res.externalMessageId, '42');
    assert.equal(calls, 1);
  });
});
