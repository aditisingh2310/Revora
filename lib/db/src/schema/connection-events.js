import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const connectionEventsTable = sqliteTable("connection_events", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    connectionId: text("connection_id").notNull(),
    providerEventId: text("provider_event_id"),
    eventType: text("event_type").notNull(),
    payload: text("payload"),
    createdAt: text("created_at").default("(datetime(`now`))"),
}, (table) => ({
    connectionIdx: index("connection_events_connection_idx").on(table.connectionId),
}));
