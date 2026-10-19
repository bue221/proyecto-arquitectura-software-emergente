import { CartoDarkTileAdapter } from "@/features/studio/map/adapters/carto-dark";
import { CartoPositronTileAdapter } from "@/features/studio/map/adapters/carto-positron";
import { EsriGrayTileAdapter } from "@/features/studio/map/adapters/esri-gray";
import { MapboxStreetsTileAdapter } from "@/features/studio/map/adapters/mapbox-streets";
import { OpenTopoTileAdapter } from "@/features/studio/map/adapters/opentopo";
import { OsmTileAdapter } from "@/features/studio/map/adapters/osm";
import {
  MAP_TILE_PROVIDER_IDS,
  type MapPreferences,
  type MapTileProvider,
  type MapTileProviderId,
  type MapTileStyle,
} from "@/features/studio/map/port";
import {
  DEFAULT_MAP_PROVIDER_ID,
  readMapPreferences,
} from "@/features/studio/map/preferences";

export { MAP_TILE_PROVIDER_IDS, isMapTileProviderId } from "@/features/studio/map/port";

const factories: Record<MapTileProviderId, () => MapTileProvider> = {
  "carto-positron": () => new CartoPositronTileAdapter(),
  "carto-dark": () => new CartoDarkTileAdapter(),
  osm: () => new OsmTileAdapter(),
  opentopo: () => new OpenTopoTileAdapter(),
  "esri-gray": () => new EsriGrayTileAdapter(),
  "mapbox-streets": () => new MapboxStreetsTileAdapter(),
};

/** Build a concrete tile adapter by id (hexagonal outbound adapter factory). */
export function createMapTileProvider(id: MapTileProviderId): MapTileProvider {
  const factory = factories[id] ?? factories[DEFAULT_MAP_PROVIDER_ID];
  return factory();
}

/** Catalog for profile config — styles without injecting a user key yet. */
export function listMapTileStyles(): MapTileStyle[] {
  return MAP_TILE_PROVIDER_IDS.map((id) => createMapTileProvider(id).style());
}

/**
 * Resolve the effective basemap for the Studio.
 * Keyed providers without an API key fall back to OpenStreetMap.
 */
export function resolveMapTileStyle(prefs?: MapPreferences): MapTileStyle {
  const effective = prefs ?? (typeof window !== "undefined" ? readMapPreferences() : {
    providerId: DEFAULT_MAP_PROVIDER_ID,
    apiKey: "",
  });

  const provider = createMapTileProvider(effective.providerId);
  const style = provider.style(effective.apiKey);

  if (style.requiresApiKey && !effective.apiKey.trim()) {
    return createMapTileProvider("osm").style();
  }

  return style;
}
