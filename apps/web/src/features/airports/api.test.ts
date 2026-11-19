import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchAirportsForMap } from "@/features/airports/api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  delete process.env.NEXT_PUBLIC_AIRPORT_API_URL;
});

describe("fetchAirportsForMap", () => {
  it("calls gateway /api/v1/airports and returns JSON", async () => {
    process.env.NEXT_PUBLIC_API_GATEWAY_URL = "http://gateway.test/";
    const payload = {
      count: 1,
      points: [{ id: "1", name: "El Dorado", iata: "BOG", lat: 4.7, lon: -74.1, text: "Bogotá · BOG" }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(fetchAirportsForMap()).resolves.toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      "http://gateway.test/api/v1/airports",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("propagates ApiError on failure", async () => {
    process.env.NEXT_PUBLIC_API_GATEWAY_URL = "http://gateway.test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "down", code: "upstream" }), { status: 502 }),
      ),
    );
    await expect(fetchAirportsForMap()).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      code: "upstream",
    });
  });
});
