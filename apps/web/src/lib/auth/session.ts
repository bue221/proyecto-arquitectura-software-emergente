export type TravelerProfile = {
  subject: string;
  displayName: string;
  email: string;
  bio: string;
  homeCity: string;
  role: string;
};

const TOKEN_KEY = "pi_access_token";
const PROFILE_KEY = "pi_traveler_profile";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredProfile(): TravelerProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TravelerProfile;
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: TravelerProfile): void {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearStoredProfile(): void {
  window.localStorage.removeItem(PROFILE_KEY);
}

export function clearSession(): void {
  clearAccessToken();
  clearStoredProfile();
}

/** Dispatched after an unusable JWT or HTTP 401 so AuthProvider drops the in-memory profile. */
export const SESSION_EXPIRED_EVENT = "pi:session-expired";

export class SessionExpiredError extends Error {
  constructor(message = "La sesión expiró. Volvé a iniciar sesión.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Client-side check only (no signature verification). Missing, malformed, or expired `exp` is unusable.
 * The Gateway remains the authority that accepts or rejects the Bearer token.
 */
export function isAccessTokenUsable(
  token: string | null | undefined,
  nowMs = Date.now(),
): token is string {
  if (!token) return false;
  const claims = decodeJwtPayload(token.trim());
  if (!claims) return false;
  const exp = claims.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return false;
  return exp * 1000 > nowMs;
}

export function notifySessionExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
