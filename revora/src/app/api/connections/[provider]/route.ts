import { NextResponse } from "next/server";
import { sqlite } from "@workspace/db";
import { resolveOrganizationId } from "@/lib/tenant";
import { getProviderCounts } from "@/lib/revenue-data";
import type { ConnectionProvider } from "../types";

export const dynamic = "force-dynamic";

const PROVIDERS = ["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"] as const;

const connectionCatalog = [
  { provider: "instagram" as const, name: "Instagram", description: "Capture conversations, customer profiles and lead activity from Instagram.", dataTypes: ["messages", "customers", "leads"] },
  { provider: "whatsapp" as const, name: "WhatsApp Business", description: "Connect your WhatsApp Business account to capture customer conversations and sales opportunities.", dataTypes: ["messages", "customers", "leads"] },
  { provider: "website" as const, name: "Website", description: "Capture customer activity and revenue events from your website with the Revora widget.", dataTypes: ["events", "customers", "leads", "orders"] },
  { provider: "shopify" as const, name: "Shopify", description: "Synchronize customers, products and orders from your Shopify store.", dataTypes: ["customers", "products", "orders", "payments"] },
  { provider: "woocommerce" as const, name: "WooCommerce", description: "Bring your WooCommerce customers, products and orders into Revora.", dataTypes: ["customers", "products", "orders", "payments"] },
  { provider: "csv" as const, name: "CSV / Excel", description: "Import historical customer and order data with a guided mapping wizard.", dataTypes: ["customers", "orders"] },
  { provider: "manual" as const, name: "Manual Import", description: "Add a revenue record when you are not ready to connect an external channel.", dataTypes: ["customers", "orders"] },
];

const providerScopes: Record<ConnectionProvider, string[]> = {
  instagram: ["instagram_basic", "instagram_manage_messages"],
  whatsapp: ["whatsapp_business_management", "whatsapp_business_messaging"],
  website: ["events:write"],
  shopify: ["read_customers", "read_products", "read_orders"],
  woocommerce: ["read:customers", "read:products", "read:orders"],
  csv: ["import:customers", "import:orders"],
  manual: ["import:orders"],
};

function syntheticConnectionId(provider: ConnectionProvider): string {
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20)}`;
}

function serializeConnection(provider: ConnectionProvider, record: Record<string, unknown> | undefined) {
  const catalog = connectionCatalog.find(c => c.provider === provider)!;
  const now = new Date().toISOString();
  if (!record) {
    return {
      id: syntheticConnectionId(provider),
      provider,
      name: catalog.name,
      description: catalog.description,
      status: "NOT_CONNECTED",
      externalAccountId: null,
      externalAccountName: null,
      connectedAt: null,
      lastSyncAt: null,
      lastSuccessAt: null,
      lastError: provider === "website" ? "Add your website URL to prepare widget tracking." : provider === "csv" || provider === "manual" ? null : "Provider credentials and official OAuth configuration are required.",
      webhookStatus: "NOT_CONFIGURED",
      syncStatus: "NOT_CONFIGURED",
      dataTypes: catalog.dataTypes,
      scopes: providerScopes[provider],
      createdAt: now,
      updatedAt: now,
    };
  }
  const config = record.configuration ? JSON.parse(String(record.configuration)) : {};
  return {
    id: String(record.id),
    provider,
    name: catalog.name,
    description: catalog.description,
    status: String(record.status),
    externalAccountId: record.external_account_id ? String(record.external_account_id) : null,
    externalAccountName: record.external_account_name ? String(record.external_account_name) : (config.websiteUrl ? String(config.websiteUrl) : null),
    connectedAt: record.connected_at ? String(record.connected_at) : null,
    lastSyncAt: record.last_sync_at ? String(record.last_sync_at) : null,
    lastSuccessAt: record.last_success_at ? String(record.last_success_at) : null,
    lastError: record.last_error ? String(record.last_error) : null,
    webhookStatus: config.webhookStatus ? String(config.webhookStatus) : "NOT_CONFIGURED",
    syncStatus: config.syncStatus ? String(config.syncStatus) : String(record.status),
    dataTypes: catalog.dataTypes,
    scopes: providerScopes[provider],
    createdAt: new Date(String(record.created_at)).toISOString(),
    updatedAt: new Date(String(record.updated_at)).toISOString(),
  };
}

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as ConnectionProvider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const provider = raw as ConnectionProvider;
  const organizationId = await resolveOrganizationId(_request);

  const recordResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, provider],
  });
  const record = recordResult.rows[0] as Record<string, unknown> | undefined;

  const activityResult = await sqlite.execute({
    sql: `SELECT s.id, c.provider, s.status, s.error, s.created_at, s.completed_at
          FROM sync_jobs s
          INNER JOIN connections c ON s.connection_id = c.id
          WHERE s.organization_id = ? AND c.provider = ?
          ORDER BY s.created_at DESC
          LIMIT 12`,
    args: [organizationId, provider],
  });

  const counts = await getProviderCounts(organizationId, provider);
  const eventCount = record ? await sqlite.execute({
    sql: "SELECT COUNT(*) as count FROM connection_events WHERE connection_id = ?",
    args: [String(record.id)],
  }) : null;

  return NextResponse.json({
    connection: serializeConnection(provider, record),
    syncJobs: [],
    activity: activityResult.rows.map(job => ({
      id: String(job.id),
      provider: String(job.provider),
      title: job.status === "FAILED" ? "Synchronization needs attention" : job.status === "SUCCEEDED" ? "Synchronization completed" : "Synchronization requested",
      detail: job.error ? String(job.error) : `Sync job is ${String(job.status).toLowerCase()}.`,
      status: job.status === "FAILED" ? "error" : "info",
      createdAt: new Date(String(job.created_at)).toISOString(),
    })),
    statistics: {
      customers: counts.customers,
      orders: counts.orders,
      leads: 0,
      events: eventCount ? Number(eventCount.rows[0]?.count ?? 0) : 0,
    },
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as ConnectionProvider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const provider = raw as ConnectionProvider;
  const body = await request.json().catch(() => ({}));

  const organizationId = await resolveOrganizationId(request);
  const existingResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, provider],
  });
  const existing = existingResult.rows[0] as Record<string, unknown> | undefined;

  const existingConfig = existing?.configuration ? JSON.parse(String(existing.configuration)) : {};
  const configuration = {
    ...existingConfig,
    ...(body.configuration ?? {}),
    ...(body.storeUrl ? { storeUrl: body.storeUrl } : {}),
  };

  if (existing) {
    await sqlite.execute({
      sql: `UPDATE connections SET
            status = ?, external_account_id = ?, external_account_name = ?,
            configuration = ?, last_error = ?, updated_at = ?
            WHERE id = ?`,
      args: [
        "NOT_CONNECTED",
        body.accountId ?? existing.external_account_id ?? null,
        body.externalAccountName ?? existing.external_account_name ?? null,
        JSON.stringify(configuration),
        "Official provider credentials and OAuth configuration are required before this channel can connect.",
        new Date().toISOString(),
        String(existing.id),
      ],
    });
  } else {
    await sqlite.execute({
      sql: `INSERT INTO connections
            (organization_id, provider, status, external_account_id, external_account_name, configuration, last_error)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        organizationId,
        provider,
        "NOT_CONNECTED",
        body.accountId ?? null,
        body.externalAccountName ?? null,
        JSON.stringify(configuration),
        "Official provider credentials and OAuth configuration are required before this channel can connect.",
      ],
    });
  }

  const updatedResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, provider],
  });
  return NextResponse.json(serializeConnection(provider, updatedResult.rows[0] as Record<string, unknown>), { status: 202 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as ConnectionProvider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const provider = raw as ConnectionProvider;
  const organizationId = await resolveOrganizationId(_request);

  const existingResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, provider],
  });
  const existing = existingResult.rows[0] as Record<string, unknown> | undefined;

  if (!existing) {
    return NextResponse.json(serializeConnection(provider, undefined));
  }

  await sqlite.execute({
    sql: `UPDATE connections SET status = ?, last_error = NULL, external_account_id = NULL, external_account_name = NULL, connected_at = NULL, updated_at = ? WHERE id = ?`,
    args: ["DISCONNECTED", new Date().toISOString(), String(existing.id)],
  });

  const updatedResult = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, provider],
  });
  return NextResponse.json(serializeConnection(provider, updatedResult.rows[0] as Record<string, unknown>));
}
