import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetAccountsReportQueryParams,
  GetAccountsReportResponse,
  GetDepartmentsReportQueryParams,
  GetDepartmentsReportResponse,
  GetOutstandingReportQueryParams,
  GetOutstandingReportResponse,
} from "@workspace/api-zod";
import { db, chequesTable, accountsTable, departmentsTable } from "@workspace/db";
import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { requireAuth } from "../lib/permissions";

const router: IRouter = Router();

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function coerceDateRange(query: Request["query"]): {
  startDate?: Date;
  endDate?: Date;
} {
  return {
    startDate: query.startDate
      ? new Date(query.startDate as string)
      : undefined,
    endDate: query.endDate ? new Date(query.endDate as string) : undefined,
  };
}

function dateRangeConditions(start?: Date, end?: Date): SQL[] {
  const conditions: SQL[] = [];
  if (start) conditions.push(gte(chequesTable.issueDate, toDateString(start)));
  if (end) conditions.push(lte(chequesTable.issueDate, toDateString(end)));
  return conditions;
}

router.get(
  "/reports/accounts",
  requireAuth,
  async (req: Request, res: Response) => {
    const { startDate, endDate } = GetAccountsReportQueryParams.parse(
      coerceDateRange(req.query),
    );
    const conditions = dateRangeConditions(startDate, endDate);

    const rows = await db
      .select({
        accountId: accountsTable.id,
        accountCode: accountsTable.code,
        accountName: accountsTable.name,
        chequeCount: sql<number>`count(${chequesTable.id})::int`,
        totalAmount: sql<number>`coalesce(sum(${chequesTable.amount}), 0)::float8`,
        outstandingCount: sql<number>`count(*) filter (where ${chequesTable.status} = 'outstanding')::int`,
        outstandingAmount: sql<number>`coalesce(sum(${chequesTable.amount}) filter (where ${chequesTable.status} = 'outstanding'), 0)::float8`,
      })
      .from(accountsTable)
      .leftJoin(
        chequesTable,
        conditions.length
          ? and(eq(chequesTable.accountId, accountsTable.id), ...conditions)
          : eq(chequesTable.accountId, accountsTable.id),
      )
      .groupBy(accountsTable.id, accountsTable.code, accountsTable.name)
      .orderBy(accountsTable.code);

    res.json(GetAccountsReportResponse.parse(rows));
  },
);

router.get(
  "/reports/departments",
  requireAuth,
  async (req: Request, res: Response) => {
    const { startDate, endDate } = GetDepartmentsReportQueryParams.parse(
      coerceDateRange(req.query),
    );
    const conditions = dateRangeConditions(startDate, endDate);

    const rows = await db
      .select({
        departmentId: departmentsTable.id,
        departmentCode: departmentsTable.code,
        departmentName: departmentsTable.name,
        chequeCount: sql<number>`count(${chequesTable.id})::int`,
        totalAmount: sql<number>`coalesce(sum(${chequesTable.amount}), 0)::float8`,
        outstandingCount: sql<number>`count(*) filter (where ${chequesTable.status} = 'outstanding')::int`,
        outstandingAmount: sql<number>`coalesce(sum(${chequesTable.amount}) filter (where ${chequesTable.status} = 'outstanding'), 0)::float8`,
      })
      .from(departmentsTable)
      .leftJoin(
        chequesTable,
        conditions.length
          ? and(
              eq(chequesTable.departmentId, departmentsTable.id),
              ...conditions,
            )
          : eq(chequesTable.departmentId, departmentsTable.id),
      )
      .groupBy(departmentsTable.id, departmentsTable.code, departmentsTable.name)
      .orderBy(departmentsTable.code);

    res.json(GetDepartmentsReportResponse.parse(rows));
  },
);

router.get(
  "/reports/outstanding",
  requireAuth,
  async (req: Request, res: Response) => {
    const { startDate, endDate } = GetOutstandingReportQueryParams.parse(
      coerceDateRange(req.query),
    );
    const conditions = [
      eq(chequesTable.status, "outstanding"),
      ...dateRangeConditions(startDate, endDate),
    ];

    const rows = await db
      .select({
        id: chequesTable.id,
        chequeNumber: chequesTable.chequeNumber,
        accountId: chequesTable.accountId,
        accountName: accountsTable.name,
        departmentId: chequesTable.departmentId,
        departmentName: departmentsTable.name,
        payee: chequesTable.payee,
        amount: chequesTable.amount,
        issueDate: chequesTable.issueDate,
        status: chequesTable.status,
        clearedDate: chequesTable.clearedDate,
        notes: chequesTable.notes,
        createdAt: chequesTable.createdAt,
        updatedAt: chequesTable.updatedAt,
      })
      .from(chequesTable)
      .innerJoin(accountsTable, eq(chequesTable.accountId, accountsTable.id))
      .innerJoin(
        departmentsTable,
        eq(chequesTable.departmentId, departmentsTable.id),
      )
      .where(and(...conditions))
      .orderBy(desc(chequesTable.issueDate), desc(chequesTable.id));

    const cheques = rows.map((row) => ({ ...row, amount: Number(row.amount) }));
    const totalAmount = cheques.reduce((sum, c) => sum + c.amount, 0);

    res.json(
      GetOutstandingReportResponse.parse({
        totalCount: cheques.length,
        totalAmount,
        cheques,
      }),
    );
  },
);

export default router;
