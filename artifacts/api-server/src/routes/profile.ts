import { Router, type IRouter, type Request, type Response } from "express";
import { GetMyProfileResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, canEdit, canManage, type Role } from "../lib/permissions";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const role = (user.role as Role) ?? "viewer";
  const data = GetMyProfileResponse.parse({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    role,
    canEdit: canEdit(role),
    canManage: canManage(role),
  });
  res.json(data);
});

export default router;
