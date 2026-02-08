// src/modules/providers/providers.factory.ts

import type { PaymentsProvider, ProviderName } from "./provider.types";
import { MockProvider } from "./mock.provider";
import { AsaasProvider } from "./asaas.provider";
import { NotImplementedProvider } from "./not-implemented.provider";

const providers: Record<ProviderName, PaymentsProvider> = {
  mock: MockProvider,
  asaas: AsaasProvider,
  cora: NotImplementedProvider("cora"),
  santander: NotImplementedProvider("santander"),
};

export function getProvider(name: ProviderName): PaymentsProvider {
  return providers[name] ?? providers.mock;
}
