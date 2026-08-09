import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const syncJobsTable = sqliteTable("sync_jobs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull(),
    connectionId: text("connection_id").notNull(),
    status: text("status").notNull(),
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
    error: text("error"),
    recordsProcessed: integer("records_processed").default(0),
    createdAt: text("created_at").default("(datetime(`now`))"),
}, (table) => ({
    orgIdx: index("sync_jobs_org_idx").on(table.organizationId),
    connectionIdx: index("sync_jobs_connection_idx").on(table.connectionId),
}));
