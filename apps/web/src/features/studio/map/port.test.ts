import { describe, expect, it } from "vitest";

import { isMapTileProviderId, MAP_TILE_PROVIDER_IDS } from "@/features/studio/map/port";

describe("isMapTileProviderId", () => {
  it("accepts every registered provider id", () => {
    for (const id of MAP_TILE_PROVIDER_IDS) {
      expect(isMapTileProviderId(id)).toBe(true);
    }
  });

  it("rejects unknown values", () => {
    expect(isMapTileProviderId("google-maps")).toBe(false);
    expect(isMapTileProviderId("")).toBe(false);
  });
});
