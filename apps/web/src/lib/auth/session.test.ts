import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SESSION_EXPIRED_EVENT,
  clearSession,
  getAccessToken,
  getStoredProfile,
  initialsFromName,
  isAccessTokenUsable,
  notifySessionExpired,
  setAccessToken,
  setStoredProfile,
} from "@/lib/auth/session";

function mockLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", { localStorage, dispatchEvent });
  vi.stubGlobal("localStorage", localStorage);
  return { store, dispatchEvent };
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("session storage", () => {
  it("returns null for token/profile without window", () => {
    expect(getAccessToken()).toBeNull();
    expect(getStoredProfile()).toBeNull();
  });

  it("round-trips token and profile, then clears session", () => {
    const { store } = mockLocalStorage();
    setAccessToken("tok");
    setStoredProfile({
      subject: "ana",
      displayName: "Ana Pérez",
      email: "ana@example.com",
      bio: "",
      homeCity: "Bogotá",
      role: "traveler",
    });
    expect(getAccessToken()).toBe("tok");
    expect(getStoredProfile()?.email).toBe("ana@example.com");
    clearSession();
    expect(store.has("pi_access_token")).toBe(false);
    expect(store.has("pi_traveler_profile")).toBe(false);
  });

  it("returns null for invalid profile JSON", () => {
    const { store } = mockLocalStorage();
    store.set("pi_traveler_profile", "{bad");
    expect(getStoredProfile()).toBeNull();
  });
});

describe("isAccessTokenUsable", () => {
  const now = 1_700_000_000_000;

  it("rejects missing, malformed, or non-numeric exp", () => {
    expect(isAccessTokenUsable(null, now)).toBe(false);
    expect(isAccessTokenUsable("not-a-jwt", now)).toBe(false);
    expect(isAccessTokenUsable(makeJwt({ sub: "x" }), now)).toBe(false);
    expect(isAccessTokenUsable(makeJwt({ exp: "soon" }), now)).toBe(false);
  });

  it("accepts future exp and rejects expired exp", () => {
    expect(isAccessTokenUsable(makeJwt({ exp: now / 1000 + 60 }), now)).toBe(true);
    expect(isAccessTokenUsable(makeJwt({ exp: now / 1000 - 1 }), now)).toBe(false);
  });
});

describe("initialsFromName / notifySessionExpired", () => {
  it("builds initials", () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName("  Ana  ")).toBe("AN");
    expect(initialsFromName("Ana Pérez")).toBe("AP");
  });

  it("dispatches session-expired event when window exists", () => {
    const { dispatchEvent } = mockLocalStorage();
    notifySessionExpired();
    expect(dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    const evt = dispatchEvent.mock.calls[0][0] as Event;
    expect(evt.type).toBe(SESSION_EXPIRED_EVENT);
  });
});
