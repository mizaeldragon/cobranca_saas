import type {
  PaymentsProvider,
  ProviderCreateChargeResult,
  ParsedWebhook,
} from "./provider.types";

export const MockProvider: PaymentsProvider = {
  name: "mock",

  async createCharge(_ctx, input): Promise<ProviderCreateChargeResult> {
    const id = `mock_${Date.now()}`;

    return {
      provider: "mock",
      provider_charge_id: id,
      payment_method: input.payment_method,
      invoice_url: `https://mock.payments.local/${id}`,
      raw: { mocked: true, id, input },
    };
  },

  parseWebhook(body: any): ParsedWebhook | null {
    if (!body) return null;

    const provider_charge_id = body.provider_charge_id ?? body.charge_id ?? null;
    const paid = body.paid === true;

    if (!provider_charge_id) return null;

    return {
      provider: "mock",
      provider_charge_id: String(provider_charge_id),
      isPaid: paid,
      raw: body,
    };
  },
};
