import { getJson, sendJson } from "@/lib/api/http";
import {
  clearSession,
  getAccessToken,
  getStoredProfile,
  isAccessTokenUsable,
  notifySessionExpired,
  SessionExpiredError,
  setAccessToken,
  setStoredProfile,
  type TravelerProfile,
} from "@/lib/auth/session";

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

export type LoginInput = {
  displayName: string;
  email: string;
};

function gatewayBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_GATEWAY_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_AIRPORT_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  );
}

function subjectFromEmail(email: string): string {
  const local = email.trim().toLowerCase().split("@")[0] || "traveler";
  return local.replace(/[^a-z0-9._-]/g, "-").slice(0, 48) || "traveler";
}

export { getAccessToken };

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

export async function loginTraveler(input: LoginInput): Promise<TravelerProfile> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!email || !displayName) {
    throw new Error("Name and email are required");
  }
  const subject = subjectFromEmail(email);
  await issueAccessToken(subject, "traveler");
  const profile: TravelerProfile = {
    subject,
    displayName,
    email,
    bio: "",
    homeCity: "Bogotá",
    role: "traveler",
  };
  setStoredProfile(profile);
  return profile;
}

export function logoutTraveler(): void {
  clearSession();
}

/**
 * Return a stored usable JWT.
 * A profile with an unusable token ends the session instead of minting a demo token.
 * Without a profile, issue a demo token for guest calls.
 */
export async function ensureAccessToken(subject = "demo-traveler"): Promise<string> {
  const existing = getAccessToken();
  if (isAccessTokenUsable(existing)) return existing;
  if (getStoredProfile()) {
    clearSession();
    notifySessionExpired();
    throw new SessionExpiredError();
  }
  return issueAccessToken(subject);
}

export async function gatewayHealth(): Promise<{ status: string }> {
  return getJson(`${gatewayBase()}/health`);
}
