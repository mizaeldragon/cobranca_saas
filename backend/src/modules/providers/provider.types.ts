// src/modules/providers/provider.types.ts

export type ProviderName = "mock" | "asaas" | "cora" | "santander";

export type PaymentMethod = "pix" | "boleto" | "card";

export type ProviderContext = {
  apiKey?: string; // Asaas usa; mock ignora
  userAgent?: string;
  clientId?: string;
  clientSecret?: string;
  certificate?: string;
  privateKey?: string;
  certificatePassword?: string;
};

export type CreateChargeCustomer = {
  name: string;
  document: string;
  email?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
};

export type CreateChargeInput = {
  amount_cents: number;
  due_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  description?: string | null;
  customer: CreateChargeCustomer;
};

export type ProviderCreateChargeResult = {
  provider: ProviderName;
  provider_charge_id: string;
  payment_method: PaymentMethod; // ✅ obrigatório (esse era o erro)
  invoice_url: string | null;
  raw: any;
};

export type ParsedWebhook = {
  provider: ProviderName;
  provider_charge_id: string;
  isPaid: boolean;
  raw: any;
};

export type PaymentsProvider = {
  name: ProviderName;

  createCharge(
    ctx: ProviderContext,
    input: CreateChargeInput
  ): Promise<ProviderCreateChargeResult>;

  cancelCharge(ctx: ProviderContext, providerChargeId: string): Promise<void>;

  parseWebhook(body: any): ParsedWebhook | null;
};
