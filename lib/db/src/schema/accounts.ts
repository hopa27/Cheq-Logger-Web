import { boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  active: boolean("active").notNull().default(true),
});

export type Account = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
