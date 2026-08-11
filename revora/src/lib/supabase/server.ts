import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client backed by the service-role key. Used by all
// revora API route handlers now that the app has unified on a single Supabase
// project (the same one the comms/Telegram data lives in). Never import this
// from client components — the service-role key bypasses RLS.
let cached: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local).",
    );
  }

  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
