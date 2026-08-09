import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const customersTable = sqliteTable("customers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull(),
    externalSource: text("external_source").default("manual"),
    externalId: text("external_id"),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    metadata: text("metadata"),
    createdAt: text("created_at").default("(datetime(`now`))"),
    updatedAt: text("updated_at").default("(datetime(`now`))"),
}, (table) => ({
    orgIdx: index("customers_org_idx").on(table.organizationId),
    orgNameIdx: index("customers_org_name_idx").on(table.organizationId, table.name),
}));
