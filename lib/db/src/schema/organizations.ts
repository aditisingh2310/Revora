import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const organizationsTable = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export type InsertOrganization = typeof organizationsTable.$inferInsert;
export type SelectOrganization = typeof organizationsTable.$inferSelect;
