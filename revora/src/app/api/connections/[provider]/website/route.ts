import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveOrganizationId } from "@/lib/tenant";
import { parseJsonColumn } from "@/lib/row-helpers";
import { PROVIDERS } from "../../types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (raw !== "website") {
    return NextResponse.json({ error: "Only website provider is supported" }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.websiteUrl) {
    return NextResponse.json({ error: "websiteUrl is required" }, { status: 400 });
  }

  const organizationId = await resolveOrganizationId(request);
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("connections")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("provider", "website")
    .maybeSingle();

  const existingConfig = existing?.configuration ? parseJsonColumn(existing.configuration) : {};
  const configuration = {
    ...existingConfig,
    websiteUrl: body.websiteUrl,
    webhookStatus: "NOT_CONFIGURED",
    syncStatus: "WAITING_FOR_FIRST_EVENT",
  };

  if (existing) {
    const { error } = await supabase
      .from("connections")
      .update({
        configuration,
        status: "NOT_CONNECTED",
        external_account_name: body.websiteUrl,
        last_error: "Waiting for the first verified website event.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", String(existing.id));
    if (error) throw new Error(`Failed to update website connection: ${error.message}`);
  } else {
    const { error } = await supabase.from("connections").insert({
      organization_id: organizationId,
      provider: "website",
      status: "NOT_CONNECTED",
      external_account_name: body.websiteUrl,
      configuration,
      last_error: "Waiting for the first verified website event.",
    });
    if (error) throw new Error(`Failed to create website connection: ${error.message}`);
  }

  const { data: record, error: loadError } = await supabase
    .from("connections")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("provider", "website")
    .maybeSingle();
  if (loadError) throw new Error(`Failed to load website connection: ${loadError.message}`);
  if (!record) {
    return NextResponse.json({ error: "Failed to load website connection" }, { status: 500 });
  }

  const config = parseJsonColumn(record.configuration);

  return NextResponse.json({
    id: String(record.id),
    provider: "website",
    name: "Website",
    description: "Capture customer activity and revenue events from your website with the Revora widget.",
    status: String(record.status),
    externalAccountId: record.external_account_id ? String(record.external_account_id) : null,
    externalAccountName: String(record.external_account_name),
    connectedAt: record.connected_at ? String(record.connected_at) : null,
    lastSyncAt: record.last_sync_at ? String(record.last_sync_at) : null,
    lastSuccessAt: record.last_success_at ? String(record.last_success_at) : null,
    lastError: String(record.last_error),
    webhookStatus: config.webhookStatus ? String(config.webhookStatus) : "NOT_CONFIGURED",
    syncStatus: config.syncStatus ? String(config.syncStatus) : String(record.status),
    dataTypes: ["events", "customers", "leads", "orders"],
    scopes: ["events:write"],
    createdAt: new Date(String(record.created_at)).toISOString(),
    updatedAt: new Date(String(record.updated_at)).toISOString(),
  });
}
