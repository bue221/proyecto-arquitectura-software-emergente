import { describe, expect, it } from "vitest";

import type { PlotlyPoint } from "@/features/airports/api";
import {
  FALLBACK_HUBS,
  estimateDurationMinutes,
  mergeAirports,
  toStudioAirport,
} from "@/features/studio/airports";

const bog: PlotlyPoint = {
  id: "1",
  name: "El Dorado",
  iata: "bog",
  lat: 4.7016,
  lon: -74.1469,
  text: "Bogotá · BOG",
};

const mde: PlotlyPoint = {
  id: "2",
  name: "José María Córdova",
  iata: "MDE",
  lat: 6.1645,
  lon: -75.4231,
  text: "Medellín · MDE",
};

describe("toStudioAirport / mergeAirports", () => {
  it("uppercases IATA, marks hubs, and parses city before ·", () => {
    const airport = toStudioAirport(bog);
    expect(airport.iata).toBe("BOG");
    expect(airport.isHub).toBe(true);
    expect(airport.city).toBe("Bogotá");
  });

  it("returns FALLBACK_HUBS when empty and filters non-finite coords", () => {
    expect(mergeAirports([])).toBe(FALLBACK_HUBS);
    const mixed = mergeAirports([
      bog,
      { ...mde, iata: "ZZZ", lat: Number.NaN },
      { id: "9", name: "Local", iata: "EOH", lat: 6.2, lon: -75.5, text: "Medellín · EOH" },
    ]);
    expect(mixed.map((a) => a.iata)).toEqual(["BOG", "EOH"]);
    expect(mixed[0].isHub).toBe(true);
  });
});

describe("estimateDurationMinutes", () => {
  it("enforces a 45-minute minimum for the same point", () => {
    const a = toStudioAirport(bog);
    expect(estimateDurationMinutes(a, a)).toBe(45);
  });

  it("returns a sane domestic duration for BOG–MDE", () => {
    const origin = toStudioAirport(bog);
    const dest = toStudioAirport(mde);
    const minutes = estimateDurationMinutes(origin, dest);
    expect(minutes).toBeGreaterThanOrEqual(45);
    expect(minutes).toBeLessThan(180);
  });
});
