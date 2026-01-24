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
    const err = new Error(message) as Error & { fieldErrors?: Record<string, string[]> };
    if (data?.details?.fieldErrors) {
      err.fieldErrors = data.details.fieldErrors;
    }
    throw err;
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
  updateCompany: (payload: {
    legalName?: string;
    bankProvider?: string;
    providerApiKey?: string | null;
    whatsappEnabled?: boolean;
    whatsappProvider?: string;
    metaAccessToken?: string | null;
    metaPhoneNumberId?: string | null;
    metaBaseUrl?: string | null;
    metaTemplateName?: string | null;
    metaTemplateLanguage?: string | null;
    emailEnabled?: boolean;
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    smtpFrom?: string | null;
    smtpSecure?: boolean;
  }) => request("/companies/me", { method: "PATCH", body: payload }),

  listCustomers: (query = "") => request(`/customers${query}`),
  createCustomer: (payload: unknown) => request("/customers", { method: "POST", body: payload }),
  updateCustomer: (id: string, payload: unknown) => request(`/customers/${id}`, { method: "PATCH", body: payload }),
  deleteCustomer: (id: string) => request(`/customers/${id}`, { method: "DELETE" }),

  listCharges: (query = "") => request(`/charges${query}`),
  getCharge: (id: string) => request(`/charges/${id}`),
  createManualCharge: (payload: unknown) => request("/charges/manual", { method: "POST", body: payload }),
  updateCharge: (id: string, payload: unknown) => request(`/charges/${id}`, { method: "PATCH", body: payload }),
  cancelCharge: (id: string) => request(`/charges/${id}/cancel`, { method: "POST" }),

  listSubscriptions: (query = "") => request(`/subscriptions${query}`),
  createSubscription: (payload: unknown) => request("/subscriptions", { method: "POST", body: payload }),
  updateSubscription: (id: string, payload: unknown) =>
    request(`/subscriptions/${id}`, { method: "PATCH", body: payload }),
  deleteSubscription: (id: string) => request(`/subscriptions/${id}`, { method: "DELETE" }),

  summary: (query = "") => request(`/reports/summary${query}`),
  mrr: () => request("/reports/mrr"),
};
