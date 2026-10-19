"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { fetchAirportsForMap } from "@/features/airports/api";
import {
  FALLBACK_HUBS,
  mergeAirports,
  type StudioAirport,
} from "@/features/studio/airports";
import { ItineraryStudioPanel } from "@/features/studio/components/ItineraryStudioPanel";
import type { MapTileStyle } from "@/features/studio/map/port";
import {
  MAP_PREFERENCES_CHANGED_EVENT,
  readMapPreferences,
} from "@/features/studio/map/preferences";
import { resolveMapTileStyle } from "@/features/studio/map/registry";

const ColombiaMap = dynamic(
  () =>
    import("@/features/studio/components/ColombiaMap").then((m) => m.ColombiaMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 grid place-items-center bg-slate-100 text-sm text-slate-500">
        Cargando mapa de Colombia…
      </div>
    ),
  },
);

export function ItineraryStudio() {
  const [airports, setAirports] = useState<StudioAirport[]>(FALLBACK_HUBS);
  const [origin, setOrigin] = useState<StudioAirport | null>(null);
  const [destination, setDestination] = useState<StudioAirport | null>(null);
  const [loading, setLoading] = useState(true);
  const [tileStyle, setTileStyle] = useState<MapTileStyle>(() =>
    resolveMapTileStyle({ providerId: "carto-positron", apiKey: "" }),
  );

  useEffect(() => {
    const refresh = () => setTileStyle(resolveMapTileStyle(readMapPreferences()));
    refresh();
    window.addEventListener(MAP_PREFERENCES_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(MAP_PREFERENCES_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAirportsForMap();
        if (!cancelled) {
          setAirports(mergeAirports(data.points));
        }
      } catch {
        if (!cancelled) {
          setAirports(FALLBACK_HUBS);
          toast.message("Mapa en modo hubs — Airport Service no respondió");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSelectAirport = useCallback(
    (airport: StudioAirport) => {
      if (!origin || (origin && destination)) {
        setOrigin(airport);
        setDestination(null);
        return;
      }
      if (airport.id === origin.id) {
        toast.message("Elegí un destino distinto");
        return;
      }
      setDestination(airport);
    },
    [origin, destination],
  );

  const onSwap = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
  }, [origin, destination]);

  const onClear = useCallback(() => {
    setOrigin(null);
    setDestination(null);
  }, []);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-slate-50">
      <ColombiaMap
        airports={airports}
        origin={origin}
        destination={destination}
        onSelectAirport={onSelectAirport}
        tileStyle={tileStyle}
      />

      <div className="absolute left-4 top-4 z-10 max-w-xs">
        <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-xs text-slate-600 shadow-sm backdrop-blur">
          {loading
            ? "Sincronizando aeropuertos…"
            : `${airports.length} aeropuertos · ${tileStyle.label}`}
          <span className="mt-1 block text-[10px] text-slate-500">
            Basemap en{" "}
            <Link href="/profile" className="font-medium text-indigo-600 underline-offset-2 hover:underline">
              Perfil → Configuración de mapa
            </Link>
          </span>
        </div>
      </div>

      <ItineraryStudioPanel
        airports={airports}
        origin={origin}
        destination={destination}
        onOriginChange={(a) => {
          setOrigin(a);
          if (destination?.id === a.id) setDestination(null);
        }}
        onDestinationChange={(a) => {
          setDestination(a);
          if (!origin) return;
          if (origin.id === a.id) setOrigin(null);
        }}
        onSwap={onSwap}
        onClear={onClear}
      />
    </div>
  );
}
