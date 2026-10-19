/**
 * Port: map basemap contract.
 * The studio depends on this interface — never on a concrete tile CDN.
 * Swap adapters (OSM, CARTO, OpenTopo, Mapbox, …) without touching map interaction code.
 */
export type MapTileProviderId =
  | "carto-positron"
  | "carto-dark"
  | "osm"
  | "opentopo"
  | "esri-gray"
  | "mapbox-streets";

export const MAP_TILE_PROVIDER_IDS: MapTileProviderId[] = [
  "carto-positron",
  "carto-dark",
  "osm",
  "opentopo",
  "esri-gray",
  "mapbox-streets",
];

export function isMapTileProviderId(value: string): value is MapTileProviderId {
  return (MAP_TILE_PROVIDER_IDS as string[]).includes(value);
}

export type MapTileStyle = {
  /** Stable id used in env / localStorage */
  id: MapTileProviderId;
  /** Human label for config UI */
  label: string;
  /** Short blurb shown in UI */
  description: string;
  /** Leaflet TileLayer URL template */
  urlTemplate: string;
  attribution: string;
  maxZoom: number;
  /** Optional Leaflet subdomains, e.g. "abc" */
  subdomains?: string;
  /** Visual hint for UI chrome over the map */
  theme: "light" | "dark";
  /** When true, resolve falls back to OSM if no API key is stored */
  requiresApiKey: boolean;
};

export type MapTileProvider = {
  /** Optional apiKey is injected only by keyed adapters (e.g. Mapbox). */
  style(apiKey?: string): MapTileStyle;
};

/** User map preferences — stored in localStorage (never sent to our APIs). */
export type MapPreferences = {
  providerId: MapTileProviderId;
  apiKey: string;
};
