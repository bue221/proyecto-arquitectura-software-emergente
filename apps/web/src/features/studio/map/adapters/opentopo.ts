import type { MapTileProvider, MapTileStyle } from "@/features/studio/map/port";

const style: MapTileStyle = {
  id: "opentopo",
  label: "OpenTopoMap",
  description: "Relieve topográfico libre",
  urlTemplate: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  maxZoom: 17,
  subdomains: "abc",
  theme: "light",
  requiresApiKey: false,
};

/** Free OpenTopoMap terrain tiles (no API key). */
export class OpenTopoTileAdapter implements MapTileProvider {
  style(): MapTileStyle {
    return style;
  }
}
