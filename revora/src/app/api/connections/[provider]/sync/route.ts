import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveOrganizationId } from "@/lib/tenant";
import { PROVIDERS } from "../../types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as any)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const organizationId = await resolveOrganizationId(_request);
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("connections")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("provider", raw)
    .maybeSingle();

  let connectionId: string;
  if (existing) {
    connectionId = existing.id;
  } else {
    const { data: inserted, error } = await supabase
      .from("connections")
      .insert({
        organization_id: organizationId,
        provider: raw,
        status: "NOT_CONNECTED",
        last_error: "Connect this provider before requesting synchronization.",
      })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create connection: ${error.message}`);
    connectionId = inserted!.id;
  }

  const now = new Date().toISOString();
  const { data: job, error } = await supabase
    .from("sync_jobs")
    .insert({
      organization_id: organizationId,
      connection_id: connectionId,
      status: "FAILED",
      completed_at: now,
      error: "Synchronization is unavailable until official provider credentials are configured.",
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to create sync job: ${error.message}`);

  return NextResponse.json({
    id: job.id,
    provider: raw,
    status: "FAILED",
    createdAt: now,
    completedAt: now,
    error: "Synchronization is unavailable until official provider credentials are configured.",
  }, { status: 202 });
}
