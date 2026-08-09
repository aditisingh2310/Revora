import { NextResponse } from "next/server";
import { sqlite } from "@workspace/db";
import { resolveOrganizationId } from "@/lib/tenant";
import { getRevenueCounts } from "@/lib/revenue-data";
import type { ConnectionProvider } from "./types";

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

export async function GET(request: Request) {
  const organizationId = await resolveOrganizationId(request);
  const result = await sqlite.execute({
    sql: "SELECT * FROM connections WHERE organization_id = ?",
    args: [organizationId],
  });
  const records = result.rows as Record<string, unknown>[];
  const connections = PROVIDERS.map(provider => serializeConnection(provider, records.find(r => r.provider === provider)));
  const activity = await getActivity(organizationId);
  const counts = await getRevenueCounts(organizationId);
  const connected = connections.filter(item => ["CONNECTING", "CONNECTED", "SYNCING", "SYNCED"].includes(item.status)).length;
  const needsAttention = connections.filter(item => String(item.status) === "ERROR").length;
  const lastSynchronization = connections.map(item => item.lastSyncAt).filter((v): v is string => Boolean(v)).sort().at(-1) ?? null;

  return NextResponse.json({
    connections,
    catalog: connectionCatalog,
    activity,
    summary: { connected, needsAttention, lastSynchronization, ...counts },
  });
}

async function getActivity(organizationId: string) {
  const result = await sqlite.execute({
    sql: `SELECT s.id, c.provider, s.status, s.error, s.created_at, s.completed_at
          FROM sync_jobs s
          INNER JOIN connections c ON s.connection_id = c.id
          WHERE s.organization_id = ?
          ORDER BY s.created_at DESC
          LIMIT 12`,
    args: [organizationId],
  });

  return result.rows.map(job => ({
    id: String(job.id),
    provider: String(job.provider),
    title: job.status === "FAILED" ? "Synchronization needs attention" : job.status === "SUCCEEDED" ? "Synchronization completed" : "Synchronization requested",
    detail: job.error ? String(job.error) : `Sync job is ${String(job.status).toLowerCase()}.`,
    status: job.status === "FAILED" ? "error" : "info",
    createdAt: new Date(String(job.created_at)).toISOString(),
  }));
}
