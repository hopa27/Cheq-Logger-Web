import {
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { accountsTable } from "./accounts";
import { departmentsTable } from "./departments";

export const chequesTable = pgTable("cheques", {
  id: serial("id").primaryKey(),
  chequeNumber: varchar("cheque_number", { length: 64 }).notNull(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountsTable.id),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departmentsTable.id),
  payee: varchar("payee", { length: 256 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  issueDate: date("issue_date").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("outstanding"),
  clearedDate: date("cleared_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Cheque = typeof chequesTable.$inferSelect;
export type InsertCheque = typeof chequesTable.$inferInsert;
