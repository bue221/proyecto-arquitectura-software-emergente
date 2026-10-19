"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import type { StudioAirport } from "@/features/studio/airports";
import { AirportMarker, markerRole } from "@/features/studio/components/AirportMarker";
import { RouteArc } from "@/features/studio/components/RouteArc";

type ColombiaMapProps = {
  airports: StudioAirport[];
  origin: StudioAirport | null;
  destination: StudioAirport | null;
  onSelectAirport: (airport: StudioAirport) => void;
};

function FitRoute({
  origin,
  destination,
}: {
  origin: StudioAirport | null;
  destination: StudioAirport | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      map.fitBounds(
        [
          [origin.lat, origin.lon],
          [destination.lat, destination.lon],
        ],
        { padding: [80, 80], maxZoom: 7, animate: true },
      );
      return;
    }
    map.setView([4.5709, -74.2973], 5.5, { animate: true });
  }, [origin, destination, map]);
  return null;
}

export function ColombiaMap({
  airports,
  origin,
  destination,
  onSelectAirport,
}: ColombiaMapProps) {
  const hubsAndOthers = useMemo(() => {
    const hubs = airports.filter((a) => a.isHub);
    const others = airports.filter((a) => !a.isHub).slice(0, 40);
    return [...hubs, ...others];
  }, [airports]);

  return (
    <MapContainer
      center={[4.5709, -74.2973]}
      zoom={5.5}
      className="absolute inset-0 z-0 h-full w-full"
      zoomControl={false}
      attributionControl
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />
      <FitRoute origin={origin} destination={destination} />
      {origin && destination ? <RouteArc origin={origin} destination={destination} /> : null}
      {hubsAndOthers.map((airport) => (
        <AirportMarker
          key={airport.id}
          airport={airport}
          role={markerRole(airport, origin?.id ?? null, destination?.id ?? null)}
          onSelect={onSelectAirport}
        />
      ))}
    </MapContainer>
  );
}
