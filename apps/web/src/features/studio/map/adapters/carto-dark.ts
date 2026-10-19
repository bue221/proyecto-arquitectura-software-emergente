import type { MapTileProvider, MapTileStyle } from "@/features/studio/map/port";

const style: MapTileStyle = {
  id: "carto-dark",
  label: "CARTO Dark Matter",
  description: "Basemap oscuro de alto contraste",
  urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 20,
  subdomains: "abcd",
  theme: "dark",
  requiresApiKey: false,
};

/** Free CARTO Dark Matter basemap (no API key). */
export class CartoDarkTileAdapter implements MapTileProvider {
  style(): MapTileStyle {
    return style;
  }
}
