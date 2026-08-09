import { NextResponse } from "next/server";
import { sqlite } from "@workspace/db";
import { resolveOrganizationId } from "@/lib/tenant";
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
  const existingResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, "website"],
  });
  const existing = existingResult.rows[0] as Record<string, unknown> | undefined;
  const existingConfig = existing?.configuration ? JSON.parse(String(existing.configuration)) : {};

  const configuration = {
    ...existingConfig,
    websiteUrl: body.websiteUrl,
    webhookStatus: "NOT_CONFIGURED",
    syncStatus: "WAITING_FOR_FIRST_EVENT",
  };

  if (existing) {
    await sqlite.execute({
      sql: `UPDATE connections SET configuration = ?, status = ?, external_account_name = ?, last_error = ?, updated_at = ? WHERE id = ?`,
      args: [JSON.stringify(configuration), "NOT_CONNECTED", body.websiteUrl, "Waiting for the first verified website event.", new Date().toISOString(), String(existing.id)],
    });
  } else {
    await sqlite.execute({
      sql: `INSERT INTO connections (organization_id, provider, status, external_account_name, configuration, last_error) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [organizationId, "website", "NOT_CONNECTED", body.websiteUrl, JSON.stringify(configuration), "Waiting for the first verified website event."],
    });
  }

  const updatedResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, "website"],
  });
  const record = updatedResult.rows[0] as Record<string, unknown>;
  const config = JSON.parse(String(record.configuration));

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
