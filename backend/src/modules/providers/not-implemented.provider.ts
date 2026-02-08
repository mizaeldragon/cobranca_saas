import type { PaymentsProvider, ProviderName } from "./provider.types";

export function NotImplementedProvider(name: ProviderName): PaymentsProvider {
  return {
    name,
    async createCharge() {
      throw Object.assign(new Error(`Provider ${name} ainda nao suportado`), { status: 400 });
    },
    async cancelCharge() {
      throw Object.assign(new Error(`Provider ${name} ainda nao suportado`), { status: 400 });
    },
    parseWebhook() {
      return null;
    },
  };
}
