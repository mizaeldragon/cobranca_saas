import type { NextFunction, Request, Response } from "express";
import { verifyAccess } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: { companyId: string; email: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });

  const token = h.slice("Bearer ".length);
  try {
    const payload = verifyAccess(token);
    req.auth = { companyId: payload.companyId, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
