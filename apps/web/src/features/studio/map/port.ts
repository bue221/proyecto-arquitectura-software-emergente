/**
 * Port: map basemap contract.
 * The studio depends on this interface — never on a concrete tile CDN.
 * Swap adapters (OSM, CARTO, OpenTopo, …) without touching map interaction code.
 */
export type MapTileProviderId =
  | "carto-positron"
  | "carto-dark"
  | "osm"
  | "opentopo"
  | "esri-gray";

export type MapTileStyle = {
  /** Stable id used in env / localStorage */
  id: MapTileProviderId;
  /** Human label for the tile switcher */
  label: string;
  /** Short blurb shown in UI */
  description: string;
  /** Leaflet TileLayer URL template — must not require an API key */
  urlTemplate: string;
  attribution: string;
  maxZoom: number;
  /** Optional Leaflet subdomains, e.g. "abc" */
  subdomains?: string;
  /** Visual hint for UI chrome over the map */
  theme: "light" | "dark";
  /** True only for providers that work without signup / tokens */
  requiresApiKey: false;
};

export type MapTileProvider = {
  style(): MapTileStyle;
};
