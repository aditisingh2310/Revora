import { sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";
export const connectionsTable = sqliteTable("connections", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull(),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("NOT_CONNECTED"),
    externalAccountId: text("external_account_id"),
    externalAccountName: text("external_account_name"),
    configuration: text("configuration"),
    connectedAt: text("connected_at"),
    lastSyncAt: text("last_sync_at"),
    lastSuccessAt: text("last_success_at"),
    lastError: text("last_error"),
    webhookStatus: text("webhook_status").default("NOT_CONFIGURED"),
    createdAt: text("created_at").default("(datetime(`now`))"),
    updatedAt: text("updated_at").default("(datetime(`now`))"),
}, (table) => ({
    orgProviderUnique: uniqueIndex("connections_org_provider_unique").on(table.organizationId, table.provider),
    orgIdx: index("connections_org_idx").on(table.organizationId),
    providerIdx: index("connections_provider_idx").on(table.provider),
}));
