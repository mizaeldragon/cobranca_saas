import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { ReportsController } from "./reports.controller";

export const reportsRoutes = Router();
reportsRoutes.use(requireAuth, requireTenant, attachUser);

// FINANCE+ pode ver relatórios
reportsRoutes.get("/summary", requireRole(["OWNER","ADMIN","FINANCE"]), ReportsController.summary);
reportsRoutes.get("/mrr", requireRole(["OWNER","ADMIN","FINANCE"]), ReportsController.mrr);
