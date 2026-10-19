import type { LatLngExpression } from "leaflet";

import type { StudioAirport } from "@/features/studio/airports";

/** Quadratic Bézier arc in lat/lon for a soft great-circle-ish route. */
export function curvedRoute(
  origin: StudioAirport,
  dest: StudioAirport,
  segments = 48,
): LatLngExpression[] {
  const midLat = (origin.lat + dest.lat) / 2;
  const midLon = (origin.lon + dest.lon) / 2;
  // Bulge perpendicular to the chord
  const dx = dest.lon - origin.lon;
  const dy = dest.lat - origin.lat;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const bulge = Math.min(2.2, len * 0.35);
  const cx = midLon - (dy / len) * bulge;
  const cy = midLat + (dx / len) * bulge;

  const points: LatLngExpression[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    const lat = u * u * origin.lat + 2 * u * t * cy + t * t * dest.lat;
    const lon = u * u * origin.lon + 2 * u * t * cx + t * t * dest.lon;
    points.push([lat, lon]);
  }
  return points;
}
