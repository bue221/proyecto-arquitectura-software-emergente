"use client";

import { Polyline } from "react-leaflet";

import type { StudioAirport } from "@/features/studio/airports";
import { curvedRoute } from "@/features/studio/geo";

type RouteArcProps = {
  origin: StudioAirport;
  destination: StudioAirport;
};

export function RouteArc({ origin, destination }: RouteArcProps) {
  const positions = curvedRoute(origin, destination);
  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#4f46e5",
          weight: 4,
          opacity: 0.2,
          lineCap: "round",
        }}
      />
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#4f46e5",
          weight: 3,
          opacity: 0.95,
          dashArray: "10 12",
          lineCap: "round",
          className: "ruta-dash-animate",
        }}
      />
    </>
  );
}
