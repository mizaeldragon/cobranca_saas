import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { UsersController } from "./users.controller";

export const usersRoutes = Router();

usersRoutes.use(requireAuth, requireTenant, attachUser);

// só OWNER/ADMIN gerenciam usuários
usersRoutes.get("/", requireRole(["OWNER", "ADMIN"]), UsersController.list);

usersRoutes.post(
  "/",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["ADMIN", "FINANCE", "VIEWER"]),
    })
  ),
  UsersController.create
);

usersRoutes.patch(
  "/:id",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      fullName: z.string().min(2).optional(),
      role: z.enum(["ADMIN", "FINANCE", "VIEWER", "OWNER"]).optional(),
      active: z.boolean().optional(),
    })
  ),
  UsersController.update
);
