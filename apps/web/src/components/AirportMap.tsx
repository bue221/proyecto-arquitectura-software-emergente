"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { fetchAirportsForMap, type PlotlyPoint } from "@/lib/airports";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,560px)] items-center justify-center rounded-lg border border-[#d7e0ea] bg-[#f3f7fb] text-sm text-[#4a5d73]">
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
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl text-[#16324f]">Colombian airports</h2>
          <p className="text-sm text-[#4a5d73]">
            Data adapted by Airport Service — never called from API Colombia in the browser.
          </p>
        </div>
        <p className="rounded-md bg-[#e7f3ef] px-3 py-1 text-sm font-medium text-[#0f6a5d]">
          {loading ? "Loading…" : `${points.length} points`}
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-[#f0c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#8a2f2f]"
        >
          {error}. Start the Airport Service on port 8081 and refresh.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#d7e0ea] bg-white/80 shadow-[0_12px_40px_rgba(22,50,79,0.08)]">
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%", height: "560px" }}
          useResizeHandler
        />
      </div>
    </section>
  );
}
