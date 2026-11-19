import { describe, expect, it } from "vitest";

import { curvedRoute } from "@/features/studio/geo";
import type { StudioAirport } from "@/features/studio/airports";

const origin: StudioAirport = {
  id: "1",
  iata: "BOG",
  name: "El Dorado",
  city: "Bogotá",
  lat: 4.7016,
  lon: -74.1469,
  isHub: true,
  status: "Operativo",
};

const dest: StudioAirport = {
  id: "2",
  iata: "MDE",
  name: "José María Córdova",
  city: "Medellín",
  lat: 6.1645,
  lon: -75.4231,
  isHub: true,
  status: "Operativo",
};

describe("curvedRoute", () => {
  it("returns segments+1 points starting at origin and ending at destination", () => {
    const points = curvedRoute(origin, dest, 10);
    expect(points).toHaveLength(11);
    expect(points[0]).toEqual([origin.lat, origin.lon]);
    expect(points[points.length - 1]).toEqual([dest.lat, dest.lon]);
  });

  it("bulges away from the straight chord midpoint", () => {
    const points = curvedRoute(origin, dest, 2);
    const mid = points[1] as [number, number];
    const straightLat = (origin.lat + dest.lat) / 2;
    const straightLon = (origin.lon + dest.lon) / 2;
    expect(mid[0]).not.toBeCloseTo(straightLat, 5);
    expect(mid[1]).not.toBeCloseTo(straightLon, 5);
  });
});
