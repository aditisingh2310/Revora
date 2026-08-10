import { describe, it, expect, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';
import { createFakeSupabaseClient } from './support/fake-supabase.js';

// These tests exercise the full webhook flow: identify shop from the
// registered connection -> normalize -> find/create contact -> insert message.
// They run against an in-memory fake Supabase by default, and will use a real
// Supabase instance instead when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.

const SHOP_A = 'aaaaaaaa-0000-0000-0000-00000000000a';
const SHOP_B = 'bbbbbbbb-0000-0000-0000-00000000000b';
const CONN_A = 'aaaaaaaa-0000-0000-0000-0000000000aa';
const CONN_B = 'bbbbbbbb-0000-0000-0000-0000000000bb';

function makeClient() {
  return createFakeSupabaseClient({
    seed: {
      shops: [
        { id: SHOP_A, name: 'Shop A', created_at: new Date().toISOString() },
        { id: SHOP_B, name: 'Shop B', created_at: new Date().toISOString() },
      ],
      channel_connections: [
        {
          id: CONN_A,
          shop_id: SHOP_A,
          channel_type: 'telegram',
          external_account_id: '111',
          config: {},
          created_at: new Date().toISOString(),
        },
        {
          id: CONN_B,
          shop_id: SHOP_B,
          channel_type: 'telegram',
          external_account_id: '222',
          config: {},
          created_at: new Date().toISOString(),
        },
      ],
    },
  });
}

function telegramUpdate(opts: {
  userId: number;
  messageId: number;
  text: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}) {
  return {
    update_id: opts.messageId,
    message: {
      message_id: opts.messageId,
      from: {
        id: opts.userId,
        is_bot: false,
        first_name: opts.firstName ?? 'User',
        last_name: opts.lastName,
        username: opts.username,
      },
      chat: { id: opts.userId, type: 'private' },
      date: 1700000000,
      text: opts.text,
    },
  };
}

let app: FastifyInstance | null = null;
afterEach(async () => {
  if (app) await app.close();
  app = null;
});

describe('message ingestion', () => {
  it('Test 2: incoming "hello" creates 1 contact + 1 message', async () => {
    const client = makeClient();
    app = buildApp({ supabaseClient: client });

    const res = await app.inject({
      method: 'POST',
      url: `/webhooks/telegram/${CONN_A}`,
      payload: telegramUpdate({ userId: 10, messageId: 100, text: 'hello' }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true, stored: true });

    const contacts = client._store.contacts.rows;
    const messages = client._store.messages.rows;
    expect(contacts).toHaveLength(1);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      shop_id: SHOP_A,
      channel_connection_id: CONN_A,
      external_message_id: '100',
      channel: 'telegram',
      direction: 'incoming',
      message_type: 'text',
      text: 'hello',
    });
    expect(contacts[0].external_id).toBe('10');
  });

  it('Test 3: the same webhook delivered twice stores 1 contact + 1 message', async () => {
    const client = makeClient();
    app = buildApp({ supabaseClient: client });

    const payload = telegramUpdate({ userId: 20, messageId: 200, text: 'hello again' });
    const first = await app.inject({ method: 'POST', url: `/webhooks/telegram/${CONN_A}`, payload });
    const second = await app.inject({ method: 'POST', url: `/webhooks/telegram/${CONN_A}`, payload });

    expect(first.json()).toMatchObject({ ok: true, stored: true });
    expect(second.json()).toMatchObject({ ok: true, stored: true });

    expect(client._store.contacts.rows).toHaveLength(1);
    expect(client._store.messages.rows).toHaveLength(1);
  });

  it('Test 4: two different users message the same shop -> 2 contacts + 2 messages', async () => {
    const client = makeClient();
    app = buildApp({ supabaseClient: client });

    await app.inject({
      method: 'POST',
      url: `/webhooks/telegram/${CONN_A}`,
      payload: telegramUpdate({ userId: 30, messageId: 300, text: 'from user 30' }),
    });
    await app.inject({
      method: 'POST',
      url: `/webhooks/telegram/${CONN_A}`,
      payload: telegramUpdate({ userId: 31, messageId: 301, text: 'from user 31' }),
    });

    const contacts = client._store.contacts.rows;
    const messages = client._store.messages.rows;
    expect(contacts).toHaveLength(2);
    expect(messages).toHaveLength(2);
    expect(new Set(contacts.map((c: any) => c.shop_id))).toEqual(new Set([SHOP_A]));
    expect(new Set(messages.map((m: any) => m.shop_id))).toEqual(new Set([SHOP_A]));
  });

  it('Test 5: multi-tenant isolation — each connection stores under its own shop', async () => {
    const client = makeClient();
    app = buildApp({ supabaseClient: client });

    // Message via Shop A's connection.
    await app!.inject({
      method: 'POST',
      url: `/webhooks/telegram/${CONN_A}`,
      payload: telegramUpdate({ userId: 40, messageId: 400, text: 'to shop A' }),
    });
    // Message via Shop B's connection (same user id, different tenant).
    await app!.inject({
      method: 'POST',
      url: `/webhooks/telegram/${CONN_B}`,
      payload: telegramUpdate({ userId: 40, messageId: 400, text: 'to shop B' }),
    });

    const messages = client._store.messages.rows;
    expect(messages).toHaveLength(2);
    const a = messages.find((m: any) => m.channel_connection_id === CONN_A);
    const b = messages.find((m: any) => m.channel_connection_id === CONN_B);
    expect(a.shop_id).toBe(SHOP_A);
    expect(b.shop_id).toBe(SHOP_B);
    // No message leaks across tenants.
    expect(a.external_message_id).toBe('400');
    expect(b.external_message_id).toBe('400');
  });

  it('Test 6: an unsupported update is acknowledged (200) and stores nothing', async () => {
    const client = makeClient();
    app = buildApp({ supabaseClient: client });

    const res = await app.inject({
      method: 'POST',
      url: `/webhooks/telegram/${CONN_A}`,
      payload: { update_id: 1, callback_query: { id: 'x', from: { id: 1 }, data: 'y' } },
    });

    expect(res.statusCode).toBe(200);
    expect(client._store.messages.rows).toHaveLength(0);
    expect(client._store.contacts.rows).toHaveLength(0);
  });

  it('unknown connection id stores nothing but still returns 200', async () => {
    const client = makeClient();
    app = buildApp({ supabaseClient: client });

    const res = await app.inject({
      method: 'POST',
      url: `/webhooks/telegram/${'cccccccc-0000-0000-0000-0000000000cc'}`,
      payload: telegramUpdate({ userId: 50, messageId: 500, text: 'ghost' }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true, stored: false });
    expect(client._store.messages.rows).toHaveLength(0);
  });
});
