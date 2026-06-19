import { Router, type IRouter, type Request, type Response } from "express";
import {
  ListAccountsResponse,
  ListAccountsResponseItem,
  CreateAccountBody,
} from "@workspace/api-zod";
import { db, accountsTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { requireAuth, requireManage } from "../lib/permissions";

const router: IRouter = Router();

router.get("/accounts", requireAuth, async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(accountsTable)
    .orderBy(asc(accountsTable.code));
  res.json(ListAccountsResponse.parse(rows));
});

router.post(
  "/accounts",
  requireManage,
  async (req: Request, res: Response) => {
    const body = CreateAccountBody.parse(req.body);
    const [row] = await db
      .insert(accountsTable)
      .values({ code: body.code, name: body.name, active: body.active ?? true })
      .returning();
    res.status(201).json(ListAccountsResponseItem.parse(row));
  },
);

export default router;
