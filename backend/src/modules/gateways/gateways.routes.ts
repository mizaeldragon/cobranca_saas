import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { requireTenant } from "../../middleware/tenant";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../middleware/async";
import { GatewaysController } from "./gateways.controller";

const createSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("asaas"),
    label: z.string().min(2).optional(),
    active: z.boolean().optional(),
    apiKey: z.string().min(10),
    userAgent: z.string().optional(),
  }),
  z.object({
    provider: z.literal("cora"),
    label: z.string().min(2).optional(),
    active: z.boolean().optional(),
    clientId: z.string().min(5),
    certificate: z.string().min(20),
    privateKey: z.string().min(20),
    certificatePassword: z.string().optional(),
  }),
  z.object({
    provider: z.literal("santander"),
    label: z.string().min(2).optional(),
    active: z.boolean().optional(),
    clientId: z.string().min(5),
    clientSecret: z.string().min(5),
    certificate: z.string().min(20),
    certificatePassword: z.string().optional(),
    companyId: z.string().optional(),
    workspaceId: z.string().optional(),
    certificateExpiresAt: z.string().optional(),
  }),
]);

const updateSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("asaas"),
    label: z.string().min(2).optional(),
    active: z.boolean().optional(),
    apiKey: z.string().min(10).optional(),
    userAgent: z.string().optional(),
  }),
  z.object({
    provider: z.literal("cora"),
    label: z.string().min(2).optional(),
    active: z.boolean().optional(),
    clientId: z.string().min(5).optional(),
    certificate: z.string().min(20).optional(),
    privateKey: z.string().min(20).optional(),
    certificatePassword: z.string().optional(),
  }),
  z.object({
    provider: z.literal("santander"),
    label: z.string().min(2).optional(),
    active: z.boolean().optional(),
    clientId: z.string().min(5).optional(),
    clientSecret: z.string().min(5).optional(),
    certificate: z.string().min(20).optional(),
    certificatePassword: z.string().optional(),
    companyId: z.string().optional(),
    workspaceId: z.string().optional(),
    certificateExpiresAt: z.string().optional(),
  }),
]);

export const gatewaysRoutes = Router();

gatewaysRoutes.use(requireAuth, requireTenant, attachUser);

gatewaysRoutes.get("/", requireRole(["OWNER", "ADMIN"]), asyncHandler(GatewaysController.list));
gatewaysRoutes.post(
  "/",
  requireRole(["OWNER"]),
  validateBody(createSchema),
  asyncHandler(GatewaysController.create)
);
gatewaysRoutes.patch(
  "/:id",
  requireRole(["OWNER"]),
  validateBody(updateSchema),
  asyncHandler(GatewaysController.update)
);
gatewaysRoutes.post("/:id/activate", requireRole(["OWNER"]), asyncHandler(GatewaysController.activate));
gatewaysRoutes.delete("/:id", requireRole(["OWNER"]), asyncHandler(GatewaysController.remove));
