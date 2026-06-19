import { Router, type IRouter, type Request, type Response } from "express";
import {
  ListChequesQueryParams,
  ListChequesResponse,
  CreateChequeBody,
  GetChequeParams,
  GetChequeResponse,
  UpdateChequeParams,
  UpdateChequeBody,
  UpdateChequeResponse,
} from "@workspace/api-zod";
import { db, chequesTable, accountsTable, departmentsTable } from "@workspace/db";
import { and, desc, eq, gte, ilike, lte, or, type SQL } from "drizzle-orm";
import { requireAuth, requireEdit } from "../lib/permissions";

const router: IRouter = Router();

const chequeColumns = {
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
};

function mapRow(row: {
  amount: string;
  [key: string]: unknown;
}): Record<string, unknown> {
  return { ...row, amount: Number(row.amount) };
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

async function fetchChequeById(id: number) {
  const [row] = await db
    .select(chequeColumns)
    .from(chequesTable)
    .innerJoin(accountsTable, eq(chequesTable.accountId, accountsTable.id))
    .innerJoin(
      departmentsTable,
      eq(chequesTable.departmentId, departmentsTable.id),
    )
    .where(eq(chequesTable.id, id));
  return row;
}

router.get("/cheques", requireAuth, async (req: Request, res: Response) => {
  const params = ListChequesQueryParams.parse({
    ...req.query,
    startDate: req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined,
    endDate: req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined,
  });
  const conditions: SQL[] = [];

  if (params.startDate) {
    conditions.push(gte(chequesTable.issueDate, toDateString(params.startDate)));
  }
  if (params.endDate) {
    conditions.push(lte(chequesTable.issueDate, toDateString(params.endDate)));
  }
  if (params.accountId !== undefined) {
    conditions.push(eq(chequesTable.accountId, params.accountId));
  }
  if (params.departmentId !== undefined) {
    conditions.push(eq(chequesTable.departmentId, params.departmentId));
  }
  if (params.status) {
    conditions.push(eq(chequesTable.status, params.status));
  }
  if (params.search) {
    const term = `%${params.search}%`;
    const search = or(
      ilike(chequesTable.chequeNumber, term),
      ilike(chequesTable.payee, term),
    );
    if (search) conditions.push(search);
  }

  const rows = await db
    .select(chequeColumns)
    .from(chequesTable)
    .innerJoin(accountsTable, eq(chequesTable.accountId, accountsTable.id))
    .innerJoin(
      departmentsTable,
      eq(chequesTable.departmentId, departmentsTable.id),
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(chequesTable.issueDate), desc(chequesTable.id));

  res.json(ListChequesResponse.parse(rows.map(mapRow)));
});

router.post("/cheques", requireEdit, async (req: Request, res: Response) => {
  const body = CreateChequeBody.parse(req.body);
  const [inserted] = await db
    .insert(chequesTable)
    .values({
      chequeNumber: body.chequeNumber,
      accountId: body.accountId,
      departmentId: body.departmentId,
      payee: body.payee,
      amount: body.amount.toFixed(2),
      issueDate: toDateString(body.issueDate),
      status: body.status ?? "outstanding",
      clearedDate: body.clearedDate ? toDateString(body.clearedDate) : null,
      notes: body.notes ?? null,
    })
    .returning({ id: chequesTable.id });

  const row = await fetchChequeById(inserted.id);
  res.status(201).json(GetChequeResponse.parse(mapRow(row)));
});

router.get(
  "/cheques/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = GetChequeParams.parse(req.params);
    const row = await fetchChequeById(id);
    if (!row) {
      res.status(404).json({ error: "Cheque not found" });
      return;
    }
    res.json(GetChequeResponse.parse(mapRow(row)));
  },
);

router.patch(
  "/cheques/:id",
  requireEdit,
  async (req: Request, res: Response) => {
    const { id } = UpdateChequeParams.parse(req.params);
    const body = UpdateChequeBody.parse(req.body);

    const existing = await fetchChequeById(id);
    if (!existing) {
      res.status(404).json({ error: "Cheque not found" });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (body.chequeNumber !== undefined) updates.chequeNumber = body.chequeNumber;
    if (body.accountId !== undefined) updates.accountId = body.accountId;
    if (body.departmentId !== undefined) updates.departmentId = body.departmentId;
    if (body.payee !== undefined) updates.payee = body.payee;
    if (body.amount !== undefined) updates.amount = body.amount.toFixed(2);
    if (body.issueDate !== undefined) {
      updates.issueDate = toDateString(body.issueDate);
    }
    if (body.status !== undefined) updates.status = body.status;
    if (body.clearedDate !== undefined) {
      updates.clearedDate = body.clearedDate
        ? toDateString(body.clearedDate)
        : null;
    }
    if (body.notes !== undefined) updates.notes = body.notes ?? null;

    if (Object.keys(updates).length > 0) {
      await db
        .update(chequesTable)
        .set(updates)
        .where(eq(chequesTable.id, id));
    }

    const row = await fetchChequeById(id);
    res.json(UpdateChequeResponse.parse(mapRow(row)));
  },
);

export default router;
