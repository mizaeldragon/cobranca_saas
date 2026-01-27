import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { SubscriptionsController } from "./subscriptions.controller";

export const subscriptionsRoutes = Router();

subscriptionsRoutes.use(requireAuth, requireTenant, attachUser);

// VIEWER pode ver; FINANCE+ pode gerenciar
subscriptionsRoutes.get("/", requireRole(["OWNER", "ADMIN", "FINANCE", "VIEWER"]), SubscriptionsController.list);

subscriptionsRoutes.post(
  "/",
  requireRole(["OWNER", "ADMIN", "FINANCE"]),
  validateBody(
    z.object({
      customerId: z.string().uuid(),
      amountCents: z.number().int().positive(),
      interval: z.enum(["weekly", "monthly", "yearly"]),
      paymentMethod: z.enum(["pix", "boleto", "card"]),
      nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

      fineCents: z.number().int().min(0).optional(),
      interestBps: z.number().int().min(0).optional(),
      discountCents: z.number().int().min(0).optional(),
      discountDaysBefore: z.number().int().min(0).optional(),
    })
  ),
  SubscriptionsController.create
);

subscriptionsRoutes.patch(
  "/:id",
  requireRole(["OWNER", "ADMIN", "FINANCE"]),
  validateBody(
    z.object({
      amountCents: z.number().int().positive().optional(),
      interval: z.enum(["weekly", "monthly", "yearly"]).optional(),
      paymentMethod: z.enum(["pix", "boleto", "card"]).optional(),
      nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      active: z.boolean().optional(),

      fineCents: z.number().int().min(0).optional(),
      interestBps: z.number().int().min(0).optional(),
      discountCents: z.number().int().min(0).optional(),
      discountDaysBefore: z.number().int().min(0).optional(),
    })
  ),
  SubscriptionsController.update
);

subscriptionsRoutes.delete("/:id", requireRole(["OWNER", "ADMIN", "FINANCE"]), SubscriptionsController.remove);
