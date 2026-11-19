import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/http", () => ({
  getJson: vi.fn(),
  sendJson: vi.fn(),
}));

import { sendJson } from "@/lib/api/http";
import {
  ensureAccessToken,
  issueAccessToken,
  loginTraveler,
  logoutTraveler,
} from "@/lib/api/auth";
import {
  SessionExpiredError,
  getAccessToken,
  getStoredProfile,
  setAccessToken,
  setStoredProfile,
} from "@/lib/auth/session";

const sendJsonMock = vi.mocked(sendJson);

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
  vi.stubGlobal("window", {
    localStorage,
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("localStorage", localStorage);
  return store;
}

function makeJwt(expSecondsFromNow: number): string {
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `${header}.${body}.sig`;
}

beforeEach(() => {
  mockLocalStorage();
  process.env.NEXT_PUBLIC_API_GATEWAY_URL = "http://gateway.test";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_API_GATEWAY_URL;
});

describe("loginTraveler / issueAccessToken", () => {
  it("rejects empty name or email", async () => {
    await expect(loginTraveler({ displayName: "", email: "a@b.com" })).rejects.toThrow(
      /required/i,
    );
  });

  it("issues token and stores normalized profile", async () => {
    sendJsonMock.mockResolvedValue({
      accessToken: makeJwt(120),
      tokenType: "Bearer",
      expiresAt: "2099-01-01T00:00:00Z",
    });
    const profile = await loginTraveler({
      displayName: "  Ana Pérez ",
      email: "  Ana.Pérez+dev@Example.COM ",
    });
    expect(profile.email).toBe("ana.pérez+dev@example.com");
    expect(profile.subject).toMatch(/^ana/);
    expect(sendJsonMock).toHaveBeenCalledWith(
      "http://gateway.test/auth/token",
      "POST",
      expect.objectContaining({ role: "traveler" }),
    );
    expect(getStoredProfile()?.displayName).toBe("Ana Pérez");
    expect(getAccessToken()).toBeTruthy();
  });

  it("throws when gateway omits accessToken", async () => {
    sendJsonMock.mockResolvedValue({ tokenType: "Bearer", expiresAt: "x" } as never);
    await expect(issueAccessToken("demo")).rejects.toThrow(/access token/i);
  });
});

describe("ensureAccessToken / logoutTraveler", () => {
  it("returns stored usable token", async () => {
    const token = makeJwt(120);
    setAccessToken(token);
    await expect(ensureAccessToken()).resolves.toBe(token);
    expect(sendJsonMock).not.toHaveBeenCalled();
  });

  it("ends session when profile exists but token is unusable", async () => {
    setAccessToken("bad.token.value");
    setStoredProfile({
      subject: "ana",
      displayName: "Ana",
      email: "ana@example.com",
      bio: "",
      homeCity: "Bogotá",
      role: "traveler",
    });
    await expect(ensureAccessToken()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(getStoredProfile()).toBeNull();
  });

  it("mints a demo token when there is no profile", async () => {
    sendJsonMock.mockResolvedValue({
      accessToken: makeJwt(60),
      tokenType: "Bearer",
      expiresAt: "2099-01-01T00:00:00Z",
    });
    const token = await ensureAccessToken("guest");
    expect(token).toBeTruthy();
    expect(sendJsonMock).toHaveBeenCalled();
  });

  it("clears session on logout", () => {
    setAccessToken("tok");
    setStoredProfile({
      subject: "x",
      displayName: "X",
      email: "x@y.com",
      bio: "",
      homeCity: "Bogotá",
      role: "traveler",
    });
    logoutTraveler();
    expect(getAccessToken()).toBeNull();
    expect(getStoredProfile()).toBeNull();
  });
});
