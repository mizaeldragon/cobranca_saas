import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { attachUser, requireRole } from "../../middleware/rbac";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { CompaniesController } from "./companies.controller";

export const companiesRoutes = Router();

companiesRoutes.use(requireAuth, attachUser);

// todos podem ver; só OWNER/ADMIN editam
companiesRoutes.get("/me", requireRole(["OWNER", "ADMIN", "FINANCE", "VIEWER"]), CompaniesController.me);

companiesRoutes.patch(
  "/me",
  requireRole(["OWNER", "ADMIN"]),
  validateBody(
    z.object({
      legalName: z.string().min(2).optional(),
      bankProvider: z.string().optional(), // "mock" | "cora" | ...
      providerApiKey: z.string().optional().nullable(),
      whatsappEnabled: z.boolean().optional(),
      whatsappProvider: z.enum(["meta"]).optional(),
      metaAccessToken: z.string().optional().nullable(),
      metaPhoneNumberId: z.string().optional().nullable(),
      metaBaseUrl: z.string().optional().nullable(),
      metaTemplateName: z.string().optional().nullable(),
      metaTemplateLanguage: z.string().optional().nullable(),
      emailEnabled: z.boolean().optional(),
      smtpHost: z.string().optional().nullable(),
      smtpPort: z.number().int().optional().nullable(),
      smtpUser: z.string().optional().nullable(),
      smtpPass: z.string().optional().nullable(),
      smtpFrom: z.string().optional().nullable(),
      smtpSecure: z.boolean().optional(),
    })
  ),
  CompaniesController.updateMe
);
