import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config, hasSupabaseConfig } from '../config/env.js';

// Returns a Supabase client, or null when env vars are not configured.
// The webhook handler degrades gracefully (acknowledges Telegram with 200)
// when no client is available.
export function createSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) return null;
  return createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
