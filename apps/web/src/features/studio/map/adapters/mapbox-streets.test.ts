import { describe, expect, it } from "vitest";

import { MapboxStreetsTileAdapter } from "@/features/studio/map/adapters/mapbox-streets";

describe("MapboxStreetsTileAdapter", () => {
  const adapter = new MapboxStreetsTileAdapter();

  it("embeds a trimmed token in the Mapbox URL", () => {
    const style = adapter.style("  pk.test-token  ");
    expect(style.requiresApiKey).toBe(true);
    expect(style.urlTemplate).toContain("api.mapbox.com");
    expect(style.urlTemplate).toContain(encodeURIComponent("pk.test-token"));
  });

  it("falls back to OSM tiles when the key is empty", () => {
    const style = adapter.style("   ");
    expect(style.requiresApiKey).toBe(true);
    expect(style.urlTemplate).toBe("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  });
});
