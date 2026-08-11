import { z } from 'zod';

// Subset of the Telegram Bot API types we care about for Phase 1.
// See https://core.telegram.org/bots/api#update

export const telegramUserSchema = z.object({
  id: z.number().int(),
  is_bot: z.boolean().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
});

export const telegramChatSchema = z.object({
  id: z.number().int(),
});

export const telegramMessageSchema = z.object({
  message_id: z.number().int(),
  from: telegramUserSchema.optional(),
  chat: telegramChatSchema,
  date: z.number().int(),
  text: z.string().optional(),
});

// We only handle `message` updates in Phase 1. Any other update type
// (callback_query, edited_message, etc.) is ignored safely by the adapter.
export const telegramUpdateSchema = z
  .object({
    update_id: z.number().int().optional(),
    message: telegramMessageSchema.optional(),
  })
  .passthrough();
