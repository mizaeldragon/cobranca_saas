import type { NextFunction, Request, Response } from "express";
import { query } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: "OWNER" | "ADMIN" };
    }
  }
}

export async function attachUser(req: Request, res: Response, next: NextFunction) {
  const companyId = req.auth?.companyId;
  const email = req.auth?.email;
  if (!companyId || !email) return res.status(401).json({ error: "Unauthorized" });

  const u = (
    await query<{ id: string; role: any }>(
      `SELECT id, role FROM users WHERE company_id = $1 AND email = $2 AND active = true LIMIT 1`,
      [companyId, email.toLowerCase()]
    )
  )[0];

  if (!u) return res.status(401).json({ error: "User not found" });

  req.user = { id: u.id, role: u.role };
  next();
}

export function requireRole(allowed: Array<"OWNER" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    if (!allowed.includes(role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
