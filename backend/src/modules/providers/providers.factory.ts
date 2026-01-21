// src/modules/providers/providers.factory.ts

import type { PaymentsProvider, ProviderName } from "./provider.types";
import { MockProvider } from "./mock.provider";
import { AsaasProvider } from "./asaas.provider";

const providers: Record<ProviderName, PaymentsProvider> = {
  mock: MockProvider,
  asaas: AsaasProvider,
};

export function getProvider(name: ProviderName): PaymentsProvider {
  return providers[name] ?? providers.mock;
}
