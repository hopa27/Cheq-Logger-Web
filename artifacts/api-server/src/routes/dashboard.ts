import { Router, type IRouter, type Request, type Response } from "express";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { db, chequesTable, accountsTable, departmentsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth } from "../lib/permissions";

const router: IRouter = Router();

router.get(
  "/dashboard/summary",
  requireAuth,
  async (_req: Request, res: Response) => {
    const [cheques] = await db
      .select({
        totalCheques: sql<number>`count(*)::int`,
        totalAmount: sql<number>`coalesce(sum(${chequesTable.amount}), 0)::float8`,
        outstandingCount: sql<number>`count(*) filter (where ${chequesTable.status} = 'outstanding')::int`,
        outstandingAmount: sql<number>`coalesce(sum(${chequesTable.amount}) filter (where ${chequesTable.status} = 'outstanding'), 0)::float8`,
        clearedCount: sql<number>`count(*) filter (where ${chequesTable.status} = 'cleared')::int`,
        clearedAmount: sql<number>`coalesce(sum(${chequesTable.amount}) filter (where ${chequesTable.status} = 'cleared'), 0)::float8`,
        cancelledCount: sql<number>`count(*) filter (where ${chequesTable.status} = 'cancelled')::int`,
      })
      .from(chequesTable);

    const [{ accountCount }] = await db
      .select({ accountCount: sql<number>`count(*)::int` })
      .from(accountsTable);
    const [{ departmentCount }] = await db
      .select({ departmentCount: sql<number>`count(*)::int` })
      .from(departmentsTable);

    res.json(
      GetDashboardSummaryResponse.parse({
        ...cheques,
        accountCount,
        departmentCount,
      }),
    );
  },
);

export default router;
