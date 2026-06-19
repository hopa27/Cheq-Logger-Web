import { Router, type IRouter, type Request, type Response } from "express";
import {
  ListDepartmentsResponse,
  ListDepartmentsResponseItem,
  CreateDepartmentBody,
} from "@workspace/api-zod";
import { db, departmentsTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { requireAuth, requireManage } from "../lib/permissions";

const router: IRouter = Router();

router.get(
  "/departments",
  requireAuth,
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(departmentsTable)
      .orderBy(asc(departmentsTable.code));
    res.json(ListDepartmentsResponse.parse(rows));
  },
);

router.post(
  "/departments",
  requireManage,
  async (req: Request, res: Response) => {
    const body = CreateDepartmentBody.parse(req.body);
    const [row] = await db
      .insert(departmentsTable)
      .values({ code: body.code, name: body.name, active: body.active ?? true })
      .returning();
    res.status(201).json(ListDepartmentsResponseItem.parse(row));
  },
);

export default router;
