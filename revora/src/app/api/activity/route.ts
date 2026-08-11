import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const organizationId = await resolveOrganizationId(request);
  const supabase = getSupabaseAdmin();

  const { data: jobs } = await supabase
    .from("sync_jobs")
    .select("id, connection_id, status, error, created_at, completed_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(12);

  const connIds = (jobs ?? []).map(j => j.connection_id);
  const { data: conns } = await supabase
    .from("connections")
    .select("id, provider")
    .in("id", connIds.length ? connIds : ["00000000-0000-0000-0000-000000000000"]);

  const providerById = new Map<string, string>((conns ?? []).map(c => [c.id, c.provider]));

  const activity = (jobs ?? []).map(job => ({
    id: String(job.id),
    provider: providerById.get(job.connection_id) ?? "unknown",
    title: job.status === "FAILED" ? "Synchronization needs attention" : job.status === "SUCCEEDED" ? "Synchronization completed" : "Synchronization requested",
    detail: job.error ? String(job.error) : `Sync job is ${String(job.status).toLowerCase()}.`,
    status: job.status === "FAILED" ? "error" : "info",
    createdAt: new Date(String(job.created_at)).toISOString(),
  }));

  return NextResponse.json(activity);
}
