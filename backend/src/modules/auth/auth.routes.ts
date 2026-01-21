import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { z } from "zod";
import { AuthController } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validateBody(
    z.object({
      legalName: z.string().min(2),
      document: z.string().min(11),
      email: z.string().email(),
      password: z.string().min(6),
      bankProvider: z.string().default("mock"),
      providerApiKey: z.string().optional(),
    })
  ),
  AuthController.register
);

authRoutes.post(
  "/login",
  validateBody(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
  ),
  AuthController.login
);

authRoutes.post(
  "/refresh",
  validateBody(
    z.object({
      refreshToken: z.string().min(1),
    })
  ),
  AuthController.refresh
);

authRoutes.post(
  "/logout",
  validateBody(
    z.object({
      refreshToken: z.string().min(1),
    })
  ),
  AuthController.logout
);
