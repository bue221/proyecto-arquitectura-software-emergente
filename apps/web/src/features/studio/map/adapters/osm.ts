import type { MapTileProvider, MapTileStyle } from "@/features/studio/map/port";

const style: MapTileStyle = {
  id: "osm",
  label: "OpenStreetMap",
  description: "Tiles oficiales OSM — sin token",
  urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  subdomains: "abc",
  theme: "light",
  requiresApiKey: false,
};

/** Standard OpenStreetMap raster tiles (no API key). Respect OSM tile usage policy. */
export class OsmTileAdapter implements MapTileProvider {
  style(): MapTileStyle {
    return style;
  }
}
