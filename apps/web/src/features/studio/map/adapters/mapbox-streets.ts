import type { MapTileProvider, MapTileStyle } from "@/features/studio/map/port";

/** Mapbox Streets — requires a public access token from the user config. */
export class MapboxStreetsTileAdapter implements MapTileProvider {
  style(apiKey = ""): MapTileStyle {
    const token = apiKey.trim();
    return {
      id: "mapbox-streets",
      label: "Mapbox Streets",
      description: "Requiere access token público (pk.…)",
      urlTemplate: token
        ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(token)}`
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 22,
      theme: "light",
      requiresApiKey: true,
    };
  }
}
