import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Returns a Supabase client, or null when env vars are not configured.
// The Telegram webhook route degrades gracefully (acknowledges with 200)
// when no client is available.
export function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
