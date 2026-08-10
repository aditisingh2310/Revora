import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type ConnectionProvider = "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
export const PROVIDERS: ConnectionProvider[] = ["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"];

export function isProvider(value: string): value is ConnectionProvider {
  return PROVIDERS.includes(value as ConnectionProvider);
}

const connectionCatalog = [
  { provider: "instagram" as const, name: "Instagram", description: "Capture conversations, customer profiles and lead activity from Instagram.", dataTypes: ["messages", "customers", "leads"] },
  { provider: "whatsapp" as const, name: "WhatsApp Business", description: "Connect your WhatsApp Business account to capture customer conversations and sales opportunities.", dataTypes: ["messages", "customers", "leads"] },
  { provider: "website" as const, name: "Website", description: "Capture customer activity and revenue events from your website with the Revora widget.", dataTypes: ["events", "customers", "leads", "orders"] },
  { provider: "shopify" as const, name: "Shopify", description: "Synchronize customers, products and orders from your Shopify store.", dataTypes: ["customers", "products", "orders", "payments"] },
  { provider: "woocommerce" as const, name: "WooCommerce", description: "Bring your WooCommerce customers, products and orders into Revora.", dataTypes: ["customers", "products", "orders", "payments"] },
  { provider: "csv" as const, name: "CSV / Excel", description: "Import historical customer and order data with a guided mapping wizard.", dataTypes: ["customers", "orders"] },
  { provider: "manual" as const, name: "Manual Import", description: "Add a revenue record when you are not ready to connect an external channel.", dataTypes: ["customers", "orders"] },
];

export function catalogFor(provider: ConnectionProvider) {
  return connectionCatalog.find(c => c.provider === provider)!;
}

export { connectionCatalog };

export function syntheticConnectionId(provider: ConnectionProvider): string {
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20)}`;
}

export type DbRecord = Record<string, unknown>;

const dbPath = process.env.DATABASE_PATH ?? resolve(process.cwd(), "data", "revora.db");

const dir = dirname(dbPath);
if (dir && !existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const _db = new DatabaseSync(dbPath);

const sqlite = {
  execute(opts: { sql: string; args?: unknown[] }) {
    const stmt = _db.prepare(opts.sql);
    if (opts.sql.trimStart().toUpperCase().startsWith("SELECT")) {
      const rows = (stmt.all(...((opts.args ?? []) as any[])) as Record<string, unknown>[]).map(row => {
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          if (key.startsWith("__")) continue;
          cleaned[key] = value;
        }
        return cleaned;
      });
      return { rows, columns: Object.keys(rows[0] ?? {}) };
    }
    const changes = stmt.run(...((opts.args ?? []) as any[]));
    return { rows: [], columns: [], lastInsertRowid: _db.prepare("SELECT last_insert_rowid() as id").get()?.id as number | undefined, changes };
  },
  executeMultiple(sql: string) {
    _db.exec(sql);
  },
};
export { sqlite };

export function ensureSchema() {
  sqlite.executeMultiple(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      provider TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
      external_account_id TEXT,
      external_account_name TEXT,
      configuration TEXT,
      connected_at TEXT,
      last_sync_at TEXT,
      last_success_at TEXT,
      last_error TEXT,
      webhook_status TEXT DEFAULT 'NOT_CONFIGURED',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(organization_id, provider)
    );

    CREATE TABLE IF NOT EXISTS connection_events (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      connection_id TEXT NOT NULL REFERENCES connections(id),
      provider_event_id TEXT,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_jobs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      connection_id TEXT NOT NULL REFERENCES connections(id),
      status TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error TEXT,
      records_processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      external_source TEXT DEFAULT 'manual',
      external_id TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      customer_id TEXT NOT NULL REFERENCES customers(id),
      external_source TEXT DEFAULT 'manual',
      external_id TEXT,
      product TEXT NOT NULL,
      order_value REAL NOT NULL,
      channel TEXT,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_connections_org ON connections(organization_id);
    CREATE INDEX IF NOT EXISTS idx_connections_provider ON connections(provider);
    CREATE INDEX IF NOT EXISTS idx_sync_jobs_org ON sync_jobs(organization_id);
    CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(organization_id);
    CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  `);
}

export const organizationsTable = {};
export const connectionsTable = {};
export const connectionEventsTable = {};
export const syncJobsTable = {};
export const customersTable = {};
export const ordersTable = {};
export type InsertCustomer = { organizationId: string; externalSource?: string; name: string; phone?: string; email?: string };
export type InsertOrder = { organizationId: string; customerId: string; externalSource?: string; product: string; orderValue: number; channel?: string; orderDate: string; status?: string };
export type InsertConnection = Record<string, unknown>;
export type InsertSyncJob = Record<string, unknown>;
export type InsertOrganization = { id: string; name: string };
export type InsertConnectionEvent = Record<string, unknown>;
export type SelectCustomer = Record<string, unknown>;
export type SelectOrder = Record<string, unknown>;
export type SelectConnection = Record<string, unknown>;
export type SelectSyncJob = Record<string, unknown>;
export type SelectOrganization = Record<string, unknown>;
export type SelectConnectionEvent = Record<string, unknown>;
