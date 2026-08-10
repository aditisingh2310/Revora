import type { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getChannelConnectionById } from '../../db/repositories/channels.js';
import { normalizeTelegramUpdate } from './adapter.js';
import { upsertContactFromMessage } from '../../services/contact-service.js';
import { saveIncomingMessage } from '../../services/message-service.js';

interface WebhookParams {
  connectionId: string;
}

// POST /webhooks/telegram/:connectionId
// Telegram -> identify shop from our connection -> normalize -> persist.
// Always responds 200 so Telegram does not retry indefinitely; failures are
// logged, not surfaced as 5xx.
export function registerTelegramRoutes(
  app: FastifyInstance,
  client: SupabaseClient | null,
): void {
  app.post<{ Params: WebhookParams }>(
    '/webhooks/telegram/:connectionId',
    async (request, reply) => {
      if (!client) {
        request.log.error('Supabase client not configured; cannot persist message');
        return reply.code(200).send({ ok: true, stored: false });
      }

      const connectionId = request.params.connectionId;

      try {
        const connection = await getChannelConnectionById(client, connectionId);
        if (!connection || !connection.shop_id) {
          request.log.warn({ connectionId }, 'Unknown or shop-less channel connection');
          return reply.code(200).send({ ok: true, stored: false });
        }

        // shop_id comes from OUR database, never from the Telegram payload.
        const normalized = normalizeTelegramUpdate(request.body, {
          shopId: connection.shop_id,
          channelConnectionId: connection.id,
        });

        // Unsupported / non-text update: acknowledge and move on.
        if (!normalized) {
          return reply.code(200).send({ ok: true, stored: false });
        }

        const contact = await upsertContactFromMessage(client, normalized);
        await saveIncomingMessage(client, normalized, contact.id);

        return reply.code(200).send({ ok: true, stored: true });
      } catch (err) {
        request.log.error(err, 'Error handling Telegram webhook');
        return reply.code(200).send({ ok: true, stored: false });
      }
    },
  );
}
