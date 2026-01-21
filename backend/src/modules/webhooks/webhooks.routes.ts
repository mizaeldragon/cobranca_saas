import { Router } from "express";
import { WebhooksController } from "./webhooks.controller";

export const webhooksRoutes = Router();

// Webhook geralmente NÃO usa auth
webhooksRoutes.post("/:provider", WebhooksController.handle);
