import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../middleware/async";
import { ReportsController } from "./reports.controller";

export const reportsRoutes = Router();
reportsRoutes.use(requireAuth, requireTenant, attachUser);

// OWNER/ADMIN podem ver relatorios
reportsRoutes.get("/summary", requireRole(["OWNER", "ADMIN"]), asyncHandler(ReportsController.summary));
reportsRoutes.get("/mrr", requireRole(["OWNER", "ADMIN"]), asyncHandler(ReportsController.mrr));
