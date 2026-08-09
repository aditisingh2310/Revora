import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { organizationsTable } from "./schema/organizations";
import { connectionsTable } from "./schema/connections";
import { connectionEventsTable } from "./schema/connection-events";
import { syncJobsTable } from "./schema/sync-jobs";
import { customersTable } from "./schema/customers";
import { ordersTable } from "./schema/orders";
const dbPath = process.env.DATABASE_PATH ?? resolve(process.cwd(), "data", "revora.db");
const url = dbPath.startsWith("file:") ? dbPath : `file:${dbPath}`;
const dir = dirname(dbPath.replace(/^file:/, ""));
if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}
const client = createClient({ url });
export const db = drizzle(client, {
    schema: {
        organizationsTable,
        connectionsTable,
        connectionEventsTable,
        syncJobsTable,
        customersTable,
        ordersTable,
    },
});
export { organizationsTable } from "./schema/organizations";
export { connectionsTable } from "./schema/connections";
export { connectionEventsTable } from "./schema/connection-events";
export { syncJobsTable } from "./schema/sync-jobs";
export { customersTable } from "./schema/customers";
export { ordersTable } from "./schema/orders";
const NOW = "datetime(`now`)";
export async function ensureSchema() {
    await client.executeMultiple([
        `CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (${NOW}),
      updated_at TEXT DEFAULT (${NOW})
    )`,
        `CREATE TABLE IF NOT EXISTS connections (
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
      created_at TEXT DEFAULT (${NOW}),
      updated_at TEXT DEFAULT (${NOW}),
      UNIQUE(organization_id, provider)
    )`,
        `CREATE TABLE IF NOT EXISTS connection_events (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      connection_id TEXT NOT NULL REFERENCES connections(id),
      provider_event_id TEXT,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at TEXT DEFAULT (${NOW})
    )`,
        `CREATE TABLE IF NOT EXISTS sync_jobs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      connection_id TEXT NOT NULL REFERENCES connections(id),
      status TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error TEXT,
      records_processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (${NOW})
    )`,
        `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      external_source TEXT DEFAULT 'manual',
      external_id TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (${NOW}),
      updated_at TEXT DEFAULT (${NOW})
    )`,
        `CREATE TABLE IF NOT EXISTS orders (
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
      created_at TEXT DEFAULT (${NOW}),
      updated_at TEXT DEFAULT (${NOW})
    )`,
        `CREATE INDEX IF NOT EXISTS idx_connections_org ON connections(organization_id)`,
        `CREATE INDEX IF NOT EXISTS idx_connections_provider ON connections(provider)`,
        `CREATE INDEX IF NOT EXISTS idx_sync_jobs_org ON sync_jobs(organization_id)`,
        `CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(organization_id)`,
        `CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id)`,
        `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`,
    ].join("; "));
}
