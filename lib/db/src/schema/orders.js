import { sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";
export const ordersTable = sqliteTable("orders", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull(),
    customerId: text("customer_id").notNull(),
    externalSource: text("external_source").default("manual"),
    externalId: text("external_id"),
    product: text("product").notNull(),
    orderValue: real("order_value").notNull(),
    channel: text("channel"),
    orderDate: text("order_date").notNull(),
    status: text("status").notNull().default("paid"),
    metadata: text("metadata"),
    createdAt: text("created_at").default("(datetime(`now`))"),
    updatedAt: text("updated_at").default("(datetime(`now`))"),
}, (table) => ({
    orgIdx: index("orders_org_idx").on(table.organizationId),
    customerIdx: index("orders_customer_idx").on(table.customerId),
}));
