// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { authRoutes } from "./modules/auth/auth.routes";
import { customersRoutes } from "./modules/customers/customers.routes";
import { companiesRoutes } from "./modules/companies/companies.routes";
import { subscriptionsRoutes } from "./modules/subscriptions/subscriptions.routes";
import { chargesRoutes } from "./modules/charges/charges.routes";
import { webhooksRoutes } from "./modules/webhooks/webhooks.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";
import { errorHandler } from "./middleware/error";

export const app = express();

// Se você colocar o webhook ANTES do json, perde o body parseado.
// Aqui mantemos json global e o webhook funciona (mock/maioria).
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Importante: JSON parser antes das rotas
app.use(express.json({ limit: "2mb" }));

// Rate limit global (webhook geralmente precisa ficar fora ou com limite maior)
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Rotas
app.use("/auth", authRoutes);

// Webhooks: opcional remover rate-limit só do webhook (recomendado)
app.use(
  "/webhooks",
  rateLimit({
    windowMs: 60_000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  webhooksRoutes
);

app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);

app.use("/customers", customersRoutes);
app.use("/subscriptions", subscriptionsRoutes);
app.use("/charges", chargesRoutes);

app.use("/reports", reportsRoutes);

// Handler de erro por último
app.use(errorHandler);
