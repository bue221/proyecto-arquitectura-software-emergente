import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  ensureAccessToken: vi.fn(),
}));

vi.mock("@/lib/api/http", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/http")>("@/lib/api/http");
  return {
    ...actual,
    getJson: vi.fn(),
    sendJson: vi.fn(),
  };
});

import { ensureAccessToken } from "@/lib/api/auth";
import { ApiError, getJson, sendJson } from "@/lib/api/http";
import {
  createItinerary,
  deleteItinerary,
  getItinerary,
  listItineraries,
} from "@/features/itineraries/api";
import { SessionExpiredError, getAccessToken, setStoredProfile } from "@/lib/auth/session";

const ensureAccessTokenMock = vi.mocked(ensureAccessToken);
const getJsonMock = vi.mocked(getJson);
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
}

beforeEach(() => {
  mockLocalStorage();
  process.env.NEXT_PUBLIC_API_GATEWAY_URL = "http://gateway.test";
  ensureAccessTokenMock.mockResolvedValue("jwt-token");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_API_GATEWAY_URL;
});

const baseItem = {
  id: "1",
  userName: "ana",
  originAirportId: "BOG",
  destinationAirportId: "MDE",
  travelDate: "2026-12-01",
  durationMinutes: 60,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("itineraries api", () => {
  it("coerces missing packingItems and planItems to empty arrays", async () => {
    getJsonMock.mockResolvedValue({ items: [{ ...baseItem }] });
    const items = await listItineraries();
    expect(items[0].packingItems).toEqual([]);
    expect(items[0].planItems).toEqual([]);
  });

  it("normalizes a single itinerary the same way", async () => {
    getJsonMock.mockResolvedValue({ ...baseItem });
    const item = await getItinerary("1");
    expect(item.packingItems).toEqual([]);
    expect(item.planItems).toEqual([]);
  });

  it("sends Authorization bearer on create", async () => {
    sendJsonMock.mockResolvedValue({
      ...baseItem,
      packingItems: [],
      planItems: [],
    });
    await createItinerary({
      userName: "ana",
      originAirportId: "BOG",
      destinationAirportId: "MDE",
      travelDate: "2026-12-01",
      durationMinutes: 60,
    });
    expect(sendJsonMock).toHaveBeenCalledWith(
      "http://gateway.test/api/v1/itineraries",
      "POST",
      expect.any(Object),
      expect.objectContaining({
        headers: { Authorization: "Bearer jwt-token" },
      }),
    );
  });

  it("maps HTTP 401 to SessionExpiredError and clears session", async () => {
    setStoredProfile({
      subject: "ana",
      displayName: "Ana",
      email: "ana@example.com",
      bio: "",
      homeCity: "Bogotá",
      role: "traveler",
    });
    getJsonMock.mockRejectedValue(new ApiError("unauthorized", 401, "unauthorized"));
    await expect(listItineraries()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(getAccessToken()).toBeNull();
  });

  it("rethrows non-401 ApiError", async () => {
    getJsonMock.mockRejectedValue(new ApiError("boom", 500, "internal"));
    await expect(listItineraries()).rejects.toMatchObject({ status: 500 });
  });

  it("deletes with auth headers", async () => {
    sendJsonMock.mockResolvedValue(undefined);
    await deleteItinerary("1");
    expect(sendJsonMock).toHaveBeenCalledWith(
      "http://gateway.test/api/v1/itineraries/1",
      "DELETE",
      undefined,
      expect.objectContaining({
        headers: { Authorization: "Bearer jwt-token" },
      }),
    );
  });
});
