import { z } from 'zod';

// The universal internal message model. No other part of the application should
// depend on Telegram's JSON — everything funnels through this shape. Future
// channels (WhatsApp, Instagram, ...) must produce the same structure.
export const normalizedMessageSchema = z.object({
  shopId: z.string().uuid(),
  // The inbox this message arrived through. Optional/nullable so a pure adapter
  // unit test (which may not resolve a DB inbox) still satisfies the universal
  // model; in the real webhook flow the route always supplies it.
  inboxId: z.string().uuid().nullable().optional(),
  channel: z.string(),
  channelConnectionId: z.string().uuid(),
  externalMessageId: z.string(),
  externalUserId: z.string(),
  text: z.string().nullable(),
  direction: z.enum(['incoming', 'outgoing']),
  messageType: z.string(),
  senderName: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  timestamp: z.coerce.date(),
});

export type NormalizedMessage = z.infer<typeof normalizedMessageSchema>;
