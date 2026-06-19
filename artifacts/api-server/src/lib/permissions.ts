import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type Role = "admin" | "editor" | "viewer";

export function canEdit(role: Role): boolean {
  return role === "admin" || role === "editor";
}

export function canManage(role: Role): boolean {
  return role === "admin";
}

export async function getUserRole(userId: string): Promise<Role> {
  const [row] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return (row?.role as Role) ?? "viewer";
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

export function requireEdit(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void (async () => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const role = await getUserRole(req.user.id);
    if (!canEdit(role)) {
      res.status(403).json({ error: "Edit access required" });
      return;
    }
    next();
  })();
}

export function requireManage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void (async () => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const role = await getUserRole(req.user.id);
    if (!canManage(role)) {
      res.status(403).json({ error: "Management access required" });
      return;
    }
    next();
  })();
}
