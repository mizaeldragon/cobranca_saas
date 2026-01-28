import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../middleware/async";
import { z } from "zod";
import { UsersController } from "./users.controller";

export const usersRoutes = Router();

usersRoutes.use(requireAuth, requireTenant, attachUser);

usersRoutes.get("/me", asyncHandler(UsersController.me));

usersRoutes.patch(
  "/me",
  validateBody(
    z.object({
      fullName: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().regex(/^\d{11}$/).optional(),
      currentPassword: z.string().min(1).optional(),
      newPassword: z.string().min(6).optional(),
    })
  ),
  asyncHandler(UsersController.updateMe)
);

// só OWNER/ADMIN gerenciam usuários
usersRoutes.get("/", requireRole(["OWNER", "ADMIN"]), asyncHandler(UsersController.list));

usersRoutes.post(
  "/",
  requireRole(["OWNER"]),
  validateBody(
    z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().regex(/^\d{11}$/),
      password: z.string().min(6),
      role: z.enum(["ADMIN"]),
    })
  ),
  asyncHandler(UsersController.create)
);

usersRoutes.patch(
  "/:id",
  requireRole(["OWNER"]),
  validateBody(
    z.object({
      fullName: z.string().min(2).optional(),
      role: z.enum(["ADMIN", "OWNER"]).optional(),
      active: z.boolean().optional(),
    })
  ),
  asyncHandler(UsersController.update)
);

