import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { ChargesController } from "./charges.controller";

export const chargesRoutes = Router();
chargesRoutes.use(requireAuth, requireTenant);

chargesRoutes.get("/", ChargesController.list);
chargesRoutes.get("/:id", ChargesController.getById);

chargesRoutes.post(
  "/manual",
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
  validateBody(
    z.object({
      amountCents: z.number().int().positive().optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      paymentMethod: z.enum(["pix", "boleto", "card"]).optional(),
    })
  ),
  ChargesController.update
);

chargesRoutes.post("/:id/cancel", ChargesController.cancel);

chargesRoutes.post("/:id/mark-paid", ChargesController.markPaid);
