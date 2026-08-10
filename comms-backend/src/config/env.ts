import 'dotenv/config';
import { z } from 'zod';

// All configuration comes from the environment. Secrets (Supabase service-role
// key, Telegram bot token) are read here and never written to the database.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SUPABASE_URL: z.string().trim().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().default(''),
  TELEGRAM_BOT_TOKEN: z.string().trim().default(''),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export const config = envSchema.parse(process.env);

export function hasSupabaseConfig(): boolean {
  return config.SUPABASE_URL.length > 0 && config.SUPABASE_SERVICE_ROLE_KEY.length > 0;
}
