import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_MAP_PREFERENCES,
  persistMapPreferences,
  readMapPreferences,
} from "@/features/studio/map/preferences";

function mockLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  vi.stubGlobal("window", {
    localStorage,
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("localStorage", localStorage);
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("map preferences", () => {
  it("returns defaults without window", () => {
    expect(readMapPreferences()).toEqual({
      providerId: DEFAULT_MAP_PREFERENCES.providerId,
      apiKey: "",
    });
  });

  it("persists and reads preferences from localStorage", () => {
    mockLocalStorage();
    persistMapPreferences({ providerId: "carto-dark", apiKey: "  secret  " });
    expect(readMapPreferences()).toEqual({
      providerId: "carto-dark",
      apiKey: "secret",
    });
  });

  it("migrates legacy provider key once", () => {
    const store = mockLocalStorage();
    store.set("rutaco_map_tile_provider", "opentopo");
    expect(readMapPreferences().providerId).toBe("opentopo");
    expect(store.has("rutaco_map_preferences")).toBe(true);
  });

  it("ignores invalid stored JSON and falls back", () => {
    const store = mockLocalStorage();
    store.set("rutaco_map_preferences", "{not-json");
    expect(readMapPreferences().providerId).toBe(DEFAULT_MAP_PREFERENCES.providerId);
  });
});
