import { describe, expect, it } from "vitest";

import {
  createMapTileProvider,
  listMapTileStyles,
  resolveMapTileStyle,
} from "@/features/studio/map/registry";

describe("map tile registry", () => {
  it("lists one style per provider", () => {
    const styles = listMapTileStyles();
    expect(styles.map((s) => s.id)).toEqual([
      "carto-positron",
      "carto-dark",
      "osm",
      "opentopo",
      "esri-gray",
      "mapbox-streets",
    ]);
  });

  it("defaults free providers without an API key", () => {
    const style = resolveMapTileStyle({ providerId: "carto-positron", apiKey: "" });
    expect(style.id).toBe("carto-positron");
    expect(style.requiresApiKey).toBe(false);
  });

  it("falls back to OSM when keyed provider has no API key", () => {
    const style = resolveMapTileStyle({ providerId: "mapbox-streets", apiKey: "   " });
    expect(style.id).toBe("osm");
  });

  it("keeps Mapbox when an API key is present", () => {
    const style = resolveMapTileStyle({
      providerId: "mapbox-streets",
      apiKey: "pk.test-token",
    });
    expect(style.id).toBe("mapbox-streets");
    expect(style.urlTemplate).toContain("access_token=pk.test-token");
  });

  it("builds a concrete adapter for each id", () => {
    const provider = createMapTileProvider("opentopo");
    expect(provider.style().id).toBe("opentopo");
  });
});
