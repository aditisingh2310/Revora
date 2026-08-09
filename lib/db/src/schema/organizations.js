import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const organizationsTable = sqliteTable("organizations", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: text("created_at").default("(datetime(`now`))"),
    updatedAt: text("updated_at").default("(datetime(`now`))"),
});
