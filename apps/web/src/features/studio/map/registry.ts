import { CartoDarkTileAdapter } from "@/features/studio/map/adapters/carto-dark";
import { CartoPositronTileAdapter } from "@/features/studio/map/adapters/carto-positron";
import { EsriGrayTileAdapter } from "@/features/studio/map/adapters/esri-gray";
import { OpenTopoTileAdapter } from "@/features/studio/map/adapters/opentopo";
import { OsmTileAdapter } from "@/features/studio/map/adapters/osm";
import type {
  MapTileProvider,
  MapTileProviderId,
  MapTileStyle,
} from "@/features/studio/map/port";

const STORAGE_KEY = "rutaco_map_tile_provider";

const factories: Record<MapTileProviderId, () => MapTileProvider> = {
  "carto-positron": () => new CartoPositronTileAdapter(),
  "carto-dark": () => new CartoDarkTileAdapter(),
  osm: () => new OsmTileAdapter(),
  opentopo: () => new OpenTopoTileAdapter(),
  "esri-gray": () => new EsriGrayTileAdapter(),
};

export const MAP_TILE_PROVIDER_IDS = Object.keys(factories) as MapTileProviderId[];

export function isMapTileProviderId(value: string): value is MapTileProviderId {
  return value in factories;
}

/** Build a concrete tile adapter by id (hexagonal outbound adapter factory). */
export function createMapTileProvider(id: MapTileProviderId): MapTileProvider {
  const factory = factories[id] ?? factories["carto-positron"];
  return factory();
}

export function listMapTileStyles(): MapTileStyle[] {
  return MAP_TILE_PROVIDER_IDS.map((id) => createMapTileProvider(id).style());
}

function envDefaultId(): MapTileProviderId {
  const raw = process.env.NEXT_PUBLIC_MAP_TILE_PROVIDER?.trim() || "carto-positron";
  return isMapTileProviderId(raw) ? raw : "carto-positron";
}

export function readStoredMapTileProviderId(): MapTileProviderId {
  if (typeof window === "undefined") return envDefaultId();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isMapTileProviderId(stored)) return stored;
  return envDefaultId();
}

export function persistMapTileProviderId(id: MapTileProviderId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function resolveMapTileStyle(id?: MapTileProviderId): MapTileStyle {
  return createMapTileProvider(id ?? envDefaultId()).style();
}
