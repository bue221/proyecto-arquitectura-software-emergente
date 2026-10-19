"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAirportsForMap, type PlotlyPoint } from "@/features/airports/api";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,560px)] items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">
      Loading map…
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
        text: points.map((p) => p.text),
        hoverinfo: "text",
        marker: {
          size: 8,
          color: "#0f6a5d",
          line: { width: 1, color: "#083b34" },
          opacity: 0.9,
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
        landcolor: "#e8f0e9",
        showocean: true,
        oceancolor: "#d9e8f2",
        showlakes: true,
        lakecolor: "#d9e8f2",
        showcountries: true,
        countrycolor: "#9bb0a0",
        coastlinecolor: "#6f8678",
        projection: { type: "mercator" },
        center: { lat: 4.5, lon: -74.1 },
        lataxis: { range: [-5, 14] },
        lonaxis: { range: [-82, -66] },
        bgcolor: "rgba(0,0,0,0)",
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      height: 560,
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="font-display text-2xl">Colombian airports</CardTitle>
          <CardDescription>
            Data adapted by Airport Service — never called from API Colombia in the browser.
          </CardDescription>
        </div>
        <Badge variant="secondary">{loading ? "Loading…" : `${points.length} points`}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load airports</AlertTitle>
            <AlertDescription>
              {error}. Start the Airport Service on port 8081 and refresh.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="overflow-hidden rounded-xl border bg-card">
          <Plot
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "560px" }}
            useResizeHandler
          />
        </div>
      </CardContent>
    </Card>
  );
}
