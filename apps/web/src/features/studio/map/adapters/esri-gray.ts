import type { MapTileProvider, MapTileStyle } from "@/features/studio/map/port";

const style: MapTileStyle = {
  id: "esri-gray",
  label: "Esri Light Gray",
  description: "Canvas gris claro — muy limpio para demos",
  // Public ArcGIS Online tile endpoint (no token for this basemap).
  urlTemplate:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
  maxZoom: 16,
  theme: "light",
  requiresApiKey: false,
};

/** Esri World Light Gray Base (public tiles, no API key). */
export class EsriGrayTileAdapter implements MapTileProvider {
  style(): MapTileStyle {
    return style;
  }
}
