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

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
