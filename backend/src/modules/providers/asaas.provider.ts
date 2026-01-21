// src/modules/providers/asaas.provider.ts

import axios from "axios";
import { env } from "../../config/env";
import type {
  PaymentsProvider,
  ProviderCreateChargeResult,
  ParsedWebhook,
  PaymentMethod,
} from "./provider.types";

const BASE_URL = env.ASAAS_BASE_URL ?? "https://sandbox.asaas.com/api/v3";

function mapBillingType(method: PaymentMethod) {
  if (method === "pix") return "PIX";
  if (method === "boleto") return "BOLETO";
  return "CREDIT_CARD";
}

export const AsaasProvider: PaymentsProvider = {
  name: "asaas",

  async createCharge(ctx, input): Promise<ProviderCreateChargeResult> {
    if (!ctx.apiKey) {
      throw Object.assign(new Error("Asaas apiKey is missing"), { status: 400 });
    }
    if (input.payment_method === "pix" && !env.ASAAS_ALLOW_PIX) {
      throw Object.assign(new Error("Pix indisponivel: conta Asaas nao aprovada"), { status: 422 });
    }

    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        access_token: ctx.apiKey,
        "Content-Type": "application/json",
      },
      timeout: 20_000,
    });

    // 1) cria cliente no Asaas (MVP)
    // (depois podemos melhorar: buscar cliente existente por cpfCnpj pra não duplicar)
    const customerRes = await api.post("/customers", {
      name: input.customer.name,
      cpfCnpj: input.customer.document,
      email: input.customer.email ?? undefined,
      phone: input.customer.phone ?? undefined,
    });

    const customerId = customerRes.data?.id;
    if (!customerId) {
      throw Object.assign(new Error("Asaas customer id missing"), { status: 502 });
    }

    // 2) cria cobrança
    const paymentRes = await api.post("/payments", {
      customer: customerId,
      billingType: mapBillingType(input.payment_method),
      value: Number((input.amount_cents / 100).toFixed(2)),
      dueDate: input.due_date, // YYYY-MM-DD
      description: input.description ?? undefined,
    });

    const providerChargeId = paymentRes.data?.id;
    if (!providerChargeId) {
      throw Object.assign(new Error("Asaas payment id missing"), { status: 502 });
    }

    const invoiceUrl =
      paymentRes.data?.invoiceUrl ||
      paymentRes.data?.bankSlipUrl ||
      paymentRes.data?.transactionReceiptUrl ||
      null;

    return {
      provider: "asaas",
      provider_charge_id: String(providerChargeId),
      payment_method: input.payment_method, // ✅ obrigatório (corrige TS)
      invoice_url: invoiceUrl ? String(invoiceUrl) : null,
      raw: paymentRes.data,
    };
  },

  parseWebhook(body: any): ParsedWebhook | null {
    // Formato comum do Asaas:
    // { event: "PAYMENT_RECEIVED", payment: { id: "...", status: "RECEIVED" ... } }
    if (!body?.event || !body?.payment?.id) return null;

    const event = String(body.event);
    const paymentId = String(body.payment.id);

    const status = String(body.payment.status ?? "");
    const paidEvents = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);
    const paidStatuses = new Set(["RECEIVED", "CONFIRMED"]);

    if (paidEvents.has(event) || paidStatuses.has(status)) {
      return {
        provider: "asaas",
        provider_charge_id: paymentId,
        isPaid: true,
        raw: body,
      };
    }

    // outros eventos a gente ignora por enquanto (MVP)
    return {
      provider: "asaas",
      provider_charge_id: paymentId,
      isPaid: false,
      raw: body,
    };
  },
};
