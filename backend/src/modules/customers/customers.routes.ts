import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../middleware/async";
import { z } from "zod";
import { CustomersController } from "./customers.controller";

export const customersRoutes = Router();

customersRoutes.use(requireAuth, requireTenant, attachUser);

// OWNER/ADMIN
customersRoutes.get("/", requireRole(["OWNER", "ADMIN"]), asyncHandler(CustomersController.list));

customersRoutes.post(
  "/",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      name: z.string().min(2),
      document: z.string().min(11),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
  ),
  asyncHandler(CustomersController.create)
);

customersRoutes.patch(
  "/:id",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      name: z.string().min(2).optional(),
      document: z.string().min(11).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
  ),
  asyncHandler(CustomersController.update)
);

customersRoutes.delete("/:id", requireRole(["OWNER", "ADMIN"]), asyncHandler(CustomersController.remove));
