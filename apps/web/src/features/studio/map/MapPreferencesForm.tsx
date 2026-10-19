"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MapPreferences, MapTileProviderId } from "@/features/studio/map/port";
import {
  persistMapPreferences,
  readMapPreferences,
} from "@/features/studio/map/preferences";
import { listMapTileStyles, resolveMapTileStyle } from "@/features/studio/map/registry";

export function MapPreferencesForm() {
  const catalog = useMemo(() => listMapTileStyles(), []);
  const initial = useMemo(() => readMapPreferences(), []);
  const [providerId, setProviderId] = useState<MapTileProviderId>(initial.providerId);
  const [apiKey, setApiKey] = useState(initial.apiKey);

  const selected = catalog.find((s) => s.id === providerId) ?? catalog[0];
  const preview = resolveMapTileStyle({ providerId, apiKey });
  const needsKey = Boolean(selected?.requiresApiKey);
  const willFallbackToOsm = needsKey && !apiKey.trim();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: MapPreferences = { providerId, apiKey: apiKey.trim() };
    persistMapPreferences(next);
    const effective = resolveMapTileStyle(next);
    if (needsKey && !next.apiKey) {
      toast.message(`Sin API key — Studio usará ${effective.label}`);
    } else {
      toast.success(`Mapa: ${effective.label}`);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          Configuración de mapa
        </p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">Basemap del Studio</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Por defecto usamos CARTO Positron (gratis). Si elegís un proveedor con API key y no la
          cargás, el Studio cae a OpenStreetMap.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mapProvider">Proveedor</Label>
        <select
          id="mapProvider"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value as MapTileProviderId)}
          className="h-12 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          {catalog.map((style) => (
            <option key={style.id} value={style.id}>
              {style.label}
              {style.requiresApiKey ? " (API key)" : " (gratis)"}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="text-xs text-muted-foreground">{selected.description}</p>
        ) : null}
      </div>

      {needsKey ? (
        <div className="space-y-2">
          <Label htmlFor="mapApiKey">API key / access token</Label>
          <Input
            id="mapApiKey"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="h-12 rounded-xl font-mono text-sm"
            placeholder="pk.eyJ1IjoiLi4u"
          />
          <p className="text-xs text-muted-foreground">
            Se guarda solo en este navegador (localStorage). No se envía a nuestros servicios.
          </p>
          {willFallbackToOsm ? (
            <p className="text-xs font-medium text-amber-700">
              Sin token → el Studio usará OpenStreetMap hasta que guardes una key.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Efectivo ahora: {preview.label}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Este proveedor no necesita API key. Efectivo: {preview.label}.
        </p>
      )}

      <Button type="submit" className="h-12 rounded-xl px-8">
        Guardar mapa
      </Button>
    </form>
  );
}
