export type AuthPayload = {
  companyId: string;
  userId: string;
  role: string;
  accessToken: string;
  refreshToken: string;
};

const STORAGE_KEY = "cobrancapro.auth";

export function getAuth(): AuthPayload | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

export function setAuth(payload: AuthPayload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
