import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../middleware/async";
import { z } from "zod";
import { ChargesController } from "./charges.controller";

export const chargesRoutes = Router();
chargesRoutes.use(requireAuth, requireTenant, attachUser);

// OWNER/ADMIN
chargesRoutes.get("/", requireRole(["OWNER", "ADMIN"]), asyncHandler(ChargesController.list));
chargesRoutes.get("/:id", requireRole(["OWNER", "ADMIN"]), asyncHandler(ChargesController.getById));

chargesRoutes.post(
  "/manual",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      customerId: z.string().uuid(),
      amountCents: z.number().int().positive(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      paymentMethod: z.enum(["pix", "boleto", "card"]),
      description: z.string().optional(),
    })
  ),
  asyncHandler(ChargesController.createManual)
);

chargesRoutes.patch(
  "/:id",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      amountCents: z.number().int().positive().optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      paymentMethod: z.enum(["pix", "boleto", "card"]).optional(),
    })
  ),
  asyncHandler(ChargesController.update)
);

chargesRoutes.post("/:id/cancel", requireRole(["OWNER", "ADMIN"]), asyncHandler(ChargesController.cancel));

chargesRoutes.post("/:id/mark-paid", requireRole(["OWNER", "ADMIN"]), asyncHandler(ChargesController.markPaid));

chargesRoutes.post("/:id/notify", requireRole(["OWNER", "ADMIN"]), asyncHandler(ChargesController.notify));
