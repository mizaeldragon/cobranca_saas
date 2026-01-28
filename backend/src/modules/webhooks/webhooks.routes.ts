import { Router } from "express";
import { asyncHandler } from "../../middleware/async";
import { WebhooksController } from "./webhooks.controller";

export const webhooksRoutes = Router();

// Webhook geralmente NÃO usa auth
webhooksRoutes.post("/:provider", asyncHandler(WebhooksController.handle));
