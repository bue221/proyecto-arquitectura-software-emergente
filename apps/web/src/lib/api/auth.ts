import { getJson, sendJson } from "@/lib/api/http";

const TOKEN_KEY = "pi_access_token";

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

function gatewayBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_GATEWAY_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_AIRPORT_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  );
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
}

export async function issueAccessToken(subject: string, role = "traveler"): Promise<string> {
  const data = await sendJson<TokenResponse>(`${gatewayBase()}/auth/token`, "POST", {
    subject,
    role,
  });
  if (!data?.accessToken) {
    throw new Error("Gateway did not return an access token");
  }
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function ensureAccessToken(subject = "demo-traveler"): Promise<string> {
  const existing = getAccessToken();
  if (existing) return existing;
  return issueAccessToken(subject);
}

export async function gatewayHealth(): Promise<{ status: string }> {
  return getJson(`${gatewayBase()}/health`);
}
