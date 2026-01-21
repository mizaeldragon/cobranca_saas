import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  // neste MVP, o tenant vem do JWT (req.auth.companyId)
  // mas deixamos pronto para também aceitar header se você quiser.
  const headerTenant = req.headers[env.TENANT_HEADER] as string | undefined;

  if (!req.auth?.companyId && !headerTenant) {
    return res.status(400).json({ error: "Tenant not found" });
  }
  next();
}
