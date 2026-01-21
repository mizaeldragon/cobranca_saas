import { getAuth } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth !== false) {
    const auth = getAuth();
    if (auth?.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: payload, auth: false }),
  register: (payload: {
    legalName: string;
    document: string;
    email: string;
    password: string;
    bankProvider: string;
    providerApiKey?: string;
  }) => request("/auth/register", { method: "POST", body: payload, auth: false }),

  getCompany: () => request("/companies/me"),
  updateCompany: (payload: { legalName?: string; bankProvider?: string; providerApiKey?: string | null }) =>
    request("/companies/me", { method: "PATCH", body: payload }),

  listCustomers: (query = "") => request(`/customers${query}`),
  createCustomer: (payload: unknown) => request("/customers", { method: "POST", body: payload }),

  listCharges: (query = "") => request(`/charges${query}`),
  getCharge: (id: string) => request(`/charges/${id}`),
  createManualCharge: (payload: unknown) => request("/charges/manual", { method: "POST", body: payload }),

  listSubscriptions: (query = "") => request(`/subscriptions${query}`),
  createSubscription: (payload: unknown) => request("/subscriptions", { method: "POST", body: payload }),

  summary: (query = "") => request(`/reports/summary${query}`),
  mrr: () => request("/reports/mrr"),
};
