import {
  isMapTileProviderId,
  type MapPreferences,
  type MapTileProviderId,
} from "@/features/studio/map/port";

const PREFS_KEY = "rutaco_map_preferences";
/** Legacy key from Studio basemap switcher — migrated once. */
const LEGACY_PROVIDER_KEY = "rutaco_map_tile_provider";

export const DEFAULT_MAP_PROVIDER_ID: MapTileProviderId = "carto-positron";

export const DEFAULT_MAP_PREFERENCES: MapPreferences = {
  providerId: DEFAULT_MAP_PROVIDER_ID,
  apiKey: "",
};

export const MAP_PREFERENCES_CHANGED_EVENT = "rutaco:map-preferences";

function envDefaultId(): MapTileProviderId {
  const raw = process.env.NEXT_PUBLIC_MAP_TILE_PROVIDER?.trim() || DEFAULT_MAP_PROVIDER_ID;
  return isMapTileProviderId(raw) ? raw : DEFAULT_MAP_PROVIDER_ID;
}

export function readMapPreferences(): MapPreferences {
  if (typeof window === "undefined") {
    return { providerId: envDefaultId(), apiKey: "" };
  }

  const raw = window.localStorage.getItem(PREFS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<MapPreferences>;
      const providerId =
        parsed.providerId && isMapTileProviderId(parsed.providerId)
          ? parsed.providerId
          : envDefaultId();
      return {
        providerId,
        apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      };
    } catch {
      // fall through to legacy / default
    }
  }

  const legacy = window.localStorage.getItem(LEGACY_PROVIDER_KEY);
  if (legacy && isMapTileProviderId(legacy)) {
    const migrated: MapPreferences = { providerId: legacy, apiKey: "" };
    persistMapPreferences(migrated);
    return migrated;
  }

  return { providerId: envDefaultId(), apiKey: "" };
}

export function persistMapPreferences(prefs: MapPreferences): void {
  if (typeof window === "undefined") return;
  const next: MapPreferences = {
    providerId: isMapTileProviderId(prefs.providerId)
      ? prefs.providerId
      : DEFAULT_MAP_PROVIDER_ID,
    apiKey: prefs.apiKey.trim(),
  };
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(MAP_PREFERENCES_CHANGED_EVENT, { detail: next }));
}
