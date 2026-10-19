import type { MapTileProvider, MapTileStyle } from "@/features/studio/map/port";

const style: MapTileStyle = {
  id: "carto-positron",
  label: "CARTO Positron",
  description: "Minimalista claro — ideal para nodos de aeropuerto",
  urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 20,
  subdomains: "abcd",
  theme: "light",
  requiresApiKey: false,
};

/** Free CARTO Positron basemap (no API key). */
export class CartoPositronTileAdapter implements MapTileProvider {
  style(): MapTileStyle {
    return style;
  }
}
