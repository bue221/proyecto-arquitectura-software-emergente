"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAirportsForMap, type PlotlyPoint } from "@/features/airports/api";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(62vh,520px)] items-center justify-center rounded-3xl bg-muted/50 text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

export function AirportMap() {
  const [points, setPoints] = useState<PlotlyPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAirportsForMap();
        if (!cancelled) {
          setPoints(data.points);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load airports");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo<Data[]>(
    () => [
      {
        type: "scattergeo",
        mode: "markers",
        lat: points.map((p) => p.lat),
        lon: points.map((p) => p.lon),
        text: points.map((p) => `${p.text} · id ${p.id}`),
        hoverinfo: "text",
        marker: {
          size: 9,
          color: "#e31c5f",
          line: { width: 1, color: "#ffffff" },
          opacity: 0.92,
        },
      },
    ],
    [points],
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      geo: {
        scope: "south america",
        resolution: 50,
        showland: true,
        landcolor: "#f3f1ea",
        showocean: true,
        oceancolor: "#e8eef5",
        showlakes: true,
        lakecolor: "#e8eef5",
        showcountries: true,
        countrycolor: "#cfc8bc",
        coastlinecolor: "#a89f90",
        projection: { type: "mercator" },
        center: { lat: 4.5, lon: -74.1 },
        lataxis: { range: [-5, 14] },
        lonaxis: { range: [-82, -66] },
        bgcolor: "rgba(0,0,0,0)",
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      height: 520,
    }),
    [],
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Mapa de aeropuertos</h2>
          <p className="text-sm text-muted-foreground">
            Datos vía Airport Service (nunca API Colombia desde el browser).
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {loading ? "Cargando…" : `${points.length} puntos`}
        </Badge>
      </div>
      <div className="p-3 sm:p-4">
        {error ? (
          <Alert variant="destructive" className="mb-3">
            <AlertTitle>No se pudo cargar el mapa</AlertTitle>
            <AlertDescription>
              {error}. Revisá que el Gateway esté en :8080 (`make up`) y recargá.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="overflow-hidden rounded-2xl bg-[#f7f5f0]">
          <Plot
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "520px" }}
            useResizeHandler
          />
        </div>
      </div>
    </section>
  );
}
