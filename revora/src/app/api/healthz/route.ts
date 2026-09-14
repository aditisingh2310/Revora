import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  let supabaseReachable = false;
  let supabaseError: string | null = null;
  if (supabaseConfigured) {
    try {
      const { error } = await getSupabaseAdmin().from("organizations").select("id").limit(1);
      supabaseReachable = !error;
      if (error) supabaseError = error.message;
    } catch (err) {
      supabaseReachable = false;
      supabaseError = err instanceof Error ? err.message : String(err);
    }
  }

  const body = HealthCheckResponse.parse({
    status: supabaseConfigured && supabaseReachable ? "ok" : "degraded",
    supabase: {
      configured: supabaseConfigured,
      reachable: supabaseReachable,
      error: supabaseError,
    },
  });

  return NextResponse.json(body, {
    status: supabaseConfigured && supabaseReachable ? 200 : 503,
  });
}
