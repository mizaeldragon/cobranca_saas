// src/modules/webhooks/webhooks.controller.ts
import type { Request, Response } from "express";
import { query } from "../../config/db";
import { ChargesService } from "../charges/charges.service";
import { getProvider } from "../providers/providers.factory";
import type { ProviderName } from "../providers/provider.types";

type CompanyRow = {
  id: string;
  webhook_secret: string | null;
  bank_provider: ProviderName;
};

export const WebhooksController = {
  async handle(req: Request, res: Response) {
    try {
      // 1) companyId obrigatório
      const companyId = req.query.companyId as string | undefined;
      if (!companyId) return res.status(400).json({ error: "companyId required" });

      // 2) carrega company
      const company = (await query<CompanyRow>(
        `SELECT id, webhook_secret, bank_provider FROM companies WHERE id = $1`,
        [companyId]
      ))[0];

      if (!company) return res.status(404).json({ error: "company not found" });

      // 3) valida segredo do webhook
      const expected = company.webhook_secret;
      const secret = req.header("x-webhook-secret") || req.header("asaas-access-token"); // compatível
      if (!expected || !secret || secret !== expected) {
        return res.status(401).json({ error: "Invalid webhook secret" });
      }

      // 4) parse do provider
      const provider = getProvider(company.bank_provider);
      const parsed = provider.parseWebhook(req.body);

      if (!parsed) {
        // body não reconhecido → não é erro, só ignora
        return res.status(200).json({ ok: true, ignored: true });
      }

      // 5) se webhook indica pagamento, confirma
      if (parsed.isPaid) {
        const updated = await ChargesService.confirmByProvider(
          companyId,
          parsed.provider,
          parsed.provider_charge_id,
          parsed.raw
        );

        // ⚠️ se não achou charge, NÃO quebra
        if (!updated) {
          console.warn("[webhook] charge not found for provider_charge_id:", {
            companyId,
            provider: parsed.provider,
            provider_charge_id: parsed.provider_charge_id,
            payload: parsed.raw,
          });
          return res.status(200).json({ ok: true, updated: false, reason: "charge_not_found" });
        }

        return res.status(200).json({ ok: true, updated: true, status: updated.status });
      }

      // 6) evento não é de pagamento (ex: created, canceled etc.)
      return res.status(200).json({ ok: true, ignored: true });
    } catch (err: any) {
      console.error("[webhook] error:", err);
      // webhooks: sempre responder 200/400 de forma controlada pra não loopar reenvio
      return res.status(400).json({ error: "webhook processing failed" });
    }
  },
};
