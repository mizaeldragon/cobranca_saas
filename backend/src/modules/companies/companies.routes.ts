import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { CompaniesController } from "./companies.controller";

export const companiesRoutes = Router();

companiesRoutes.use(requireAuth);

companiesRoutes.get("/me", CompaniesController.me);

companiesRoutes.patch(
  "/me",
  validateBody(
    z.object({
      legalName: z.string().min(2).optional(),
      bankProvider: z.string().optional(), // "mock" | "cora" | ...
      providerApiKey: z.string().optional().nullable(),
    })
  ),
  CompaniesController.updateMe
);
