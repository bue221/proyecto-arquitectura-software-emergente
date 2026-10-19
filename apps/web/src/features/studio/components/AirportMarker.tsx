"use client";

import { divIcon } from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

import type { StudioAirport } from "@/features/studio/airports";
import { cn } from "@/lib/utils";

type AirportMarkerProps = {
  airport: StudioAirport;
  role: "none" | "origin" | "destination" | "hover";
  onSelect: (airport: StudioAirport) => void;
};

function markerHtml(airport: StudioAirport, role: AirportMarkerProps["role"]) {
  const selected = role === "origin" || role === "destination";
  const hub = airport.isHub;
  const size = selected ? 22 : hub ? 16 : 10;
  const color =
    role === "origin" || role === "destination"
      ? "#059669"
      : role === "hover"
        ? "#4f46e5"
        : hub
          ? "#4f46e5"
          : "#94a3b8";

  return `
    <div style="position:relative;width:${size + 16}px;height:${size + 16}px;display:grid;place-items:center;">
      ${
        selected || hub
          ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color}33;animation:pulse 1.8s ease-out infinite;"></span>`
          : ""
      }
      <span style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 4px 14px rgba(15,23,42,.25);transform:scale(${selected ? 1.15 : 1});transition:transform .2s;"></span>
    </div>
  `;
}

export function AirportMarker({ airport, role, onSelect }: AirportMarkerProps) {
  const icon = divIcon({
    className: "airport-marker",
    html: markerHtml(airport, role),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker
      position={[airport.lat, airport.lon]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(airport),
      }}
      zIndexOffset={role !== "none" ? 500 : airport.isHub ? 200 : 0}
    >
      <Tooltip direction="top" offset={[0, -12]} opacity={1} className="!rounded-xl !border-0 !bg-white !px-3 !py-2 !shadow-lg">
        <div className="min-w-[140px]">
          <p className="text-xs font-extrabold tracking-wide text-slate-900">{airport.iata}</p>
          <p className="text-[11px] font-medium text-slate-600">{airport.name}</p>
          <p className="mt-1 text-[10px] text-emerald-600">{airport.status} · {airport.city}</p>
        </div>
      </Tooltip>
    </Marker>
  );
}

export function markerRole(
  airport: StudioAirport,
  originId: string | null,
  destId: string | null,
): AirportMarkerProps["role"] {
  if (originId === airport.id) return "origin";
  if (destId === airport.id) return "destination";
  return "none";
}

export function AirportLegendDot({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-slate-600", className)}>
      <span className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
