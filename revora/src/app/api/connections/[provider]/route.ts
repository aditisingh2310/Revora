import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveOrganizationId } from "@/lib/tenant";
import { getProviderCounts } from "@/lib/revenue-data";
import { parseJsonColumn } from "@/lib/row-helpers";
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

function serializeConnection(provider: ConnectionProvider, record: Record<string, unknown> | null | undefined) {
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
  const config = parseJsonColumn(record.configuration);
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

async function loadConnection(organizationId: string, provider: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("provider", provider)
    .maybeSingle();
  return data as Record<string, unknown> | null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as ConnectionProvider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const provider = raw as ConnectionProvider;
  const organizationId = await resolveOrganizationId(_request);

  const record = await loadConnection(organizationId, provider);

  const activity = await getActivity(organizationId, provider);
  const counts = await getProviderCounts(organizationId, provider);
  const eventCount = record
    ? await (async () => {
        const supabase = getSupabaseAdmin();
        const { count } = await supabase
          .from("connection_events")
          .select("*", { count: "exact", head: true })
          .eq("connection_id", String(record.id));
        return Number(count ?? 0);
      })()
    : 0;

  return NextResponse.json({
    connection: serializeConnection(provider, record),
    syncJobs: [],
    activity,
    statistics: {
      customers: counts.customers,
      orders: counts.orders,
      leads: 0,
      events: eventCount,
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
  const supabase = getSupabaseAdmin();
  const existing = await loadConnection(organizationId, provider);

  const existingConfig = existing?.configuration ? parseJsonColumn(existing.configuration) : {};
  const configuration = {
    ...existingConfig,
    ...(body.configuration ?? {}),
    ...(body.storeUrl ? { storeUrl: body.storeUrl } : {}),
  };

  if (existing) {
    const { error } = await supabase
      .from("connections")
      .update({
        status: "NOT_CONNECTED",
        external_account_id: body.accountId ?? existing.external_account_id ?? null,
        external_account_name: body.externalAccountName ?? existing.external_account_name ?? null,
        configuration,
        last_error: "Official provider credentials and OAuth configuration are required before this channel can connect.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", String(existing.id));
    if (error) throw new Error(`Failed to update connection: ${error.message}`);
  } else {
    const { error } = await supabase.from("connections").insert({
      organization_id: organizationId,
      provider,
      status: "NOT_CONNECTED",
      external_account_id: body.accountId ?? null,
      external_account_name: body.externalAccountName ?? null,
      configuration,
      last_error: "Official provider credentials and OAuth configuration are required before this channel can connect.",
    });
    if (error) throw new Error(`Failed to create connection: ${error.message}`);
  }

  const updated = await loadConnection(organizationId, provider);
  return NextResponse.json(serializeConnection(provider, updated), { status: 202 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as ConnectionProvider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const provider = raw as ConnectionProvider;
  const organizationId = await resolveOrganizationId(_request);
  const supabase = getSupabaseAdmin();
  const existing = await loadConnection(organizationId, provider);

  if (!existing) {
    return NextResponse.json(serializeConnection(provider, undefined));
  }

  const { error } = await supabase
    .from("connections")
    .update({
      status: "DISCONNECTED",
      last_error: null,
      external_account_id: null,
      external_account_name: null,
      connected_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", String(existing.id));
  if (error) throw new Error(`Failed to disconnect: ${error.message}`);

  const updated = await loadConnection(organizationId, provider);
  return NextResponse.json(serializeConnection(provider, updated));
}

async function getActivity(organizationId: string, provider: string) {
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
  const targetProvider = provider;

  return (jobs ?? [])
    .filter(job => providerById.get(job.connection_id) === targetProvider)
    .map(job => ({
      id: String(job.id),
      provider: targetProvider,
      title: job.status === "FAILED" ? "Synchronization needs attention" : job.status === "SUCCEEDED" ? "Synchronization completed" : "Synchronization requested",
      detail: job.error ? String(job.error) : `Sync job is ${String(job.status).toLowerCase()}.`,
      status: job.status === "FAILED" ? "error" : "info",
      createdAt: new Date(String(job.created_at)).toISOString(),
    }));
}
