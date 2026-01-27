import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { ChargesController } from "./charges.controller";

export const chargesRoutes = Router();
chargesRoutes.use(requireAuth, requireTenant, attachUser);

// VIEWER pode ver; FINANCE+ pode gerenciar
chargesRoutes.get("/", requireRole(["OWNER", "ADMIN", "FINANCE", "VIEWER"]), ChargesController.list);
chargesRoutes.get("/:id", requireRole(["OWNER", "ADMIN", "FINANCE", "VIEWER"]), ChargesController.getById);

chargesRoutes.post(
  "/manual",
  requireRole(["OWNER", "ADMIN", "FINANCE"]),
  validateBody(
    z.object({
      customerId: z.string().uuid(),
      amountCents: z.number().int().positive(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      paymentMethod: z.enum(["pix", "boleto", "card"]),
      description: z.string().optional(),
    })
  ),
  ChargesController.createManual
);

chargesRoutes.patch(
  "/:id",
  requireRole(["OWNER", "ADMIN", "FINANCE"]),
  validateBody(
    z.object({
      amountCents: z.number().int().positive().optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      paymentMethod: z.enum(["pix", "boleto", "card"]).optional(),
    })
  ),
  ChargesController.update
);

chargesRoutes.post("/:id/cancel", requireRole(["OWNER", "ADMIN", "FINANCE"]), ChargesController.cancel);

chargesRoutes.post("/:id/mark-paid", requireRole(["OWNER", "ADMIN", "FINANCE"]), ChargesController.markPaid);

chargesRoutes.post("/:id/notify", requireRole(["OWNER", "ADMIN", "FINANCE"]), ChargesController.notify);
