import type { PlotlyPoint } from "@/features/airports/api";

/** Priority hubs highlighted on the studio map. */
export const HUB_IATAS = ["BOG", "MDE", "CTG", "CLO", "BAQ", "PEI"] as const;

export type StudioAirport = {
  id: string;
  name: string;
  iata: string;
  city: string;
  lat: number;
  lon: number;
  isHub: boolean;
  status: string;
};

/** Fallback hubs if the Airport Service is unreachable (demo continuity). */
export const FALLBACK_HUBS: StudioAirport[] = [
  {
    id: "1",
    name: "Aeropuerto Internacional El Dorado",
    iata: "BOG",
    city: "Bogotá",
    lat: 4.7016,
    lon: -74.1469,
    isHub: true,
    status: "Operativo",
  },
  {
    id: "2",
    name: "José María Córdova",
    iata: "MDE",
    city: "Medellín / Rionegro",
    lat: 6.1645,
    lon: -75.4231,
    isHub: true,
    status: "Operativo",
  },
  {
    id: "3",
    name: "Rafael Núñez",
    iata: "CTG",
    city: "Cartagena",
    lat: 10.4424,
    lon: -75.513,
    isHub: true,
    status: "Operativo",
  },
  {
    id: "4",
    name: "Alfonso Bonilla Aragón",
    iata: "CLO",
    city: "Cali",
    lat: 3.5432,
    lon: -76.3816,
    isHub: true,
    status: "Operativo",
  },
  {
    id: "5",
    name: "Ernesto Cortissoz",
    iata: "BAQ",
    city: "Barranquilla",
    lat: 10.8896,
    lon: -74.7808,
    isHub: true,
    status: "Operativo",
  },
  {
    id: "6",
    name: "Matecaña",
    iata: "PEI",
    city: "Pereira",
    lat: 4.8127,
    lon: -75.7395,
    isHub: true,
    status: "Operativo",
  },
];

export function toStudioAirport(point: PlotlyPoint): StudioAirport {
  const iata = (point.iata || "N/A").toUpperCase();
  const isHub = (HUB_IATAS as readonly string[]).includes(iata);
  const cityFromText = point.text?.split("·")[0]?.trim() || point.name;
  return {
    id: point.id,
    name: point.name,
    iata,
    city: cityFromText,
    lat: point.lat,
    lon: point.lon,
    isHub,
    status: "Operativo",
  };
}

export function mergeAirports(points: PlotlyPoint[]): StudioAirport[] {
  if (!points.length) return FALLBACK_HUBS;
  const mapped = points
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map(toStudioAirport);
  // Prefer hubs first for combobox / map emphasis
  return mapped.sort((a, b) => Number(b.isHub) - Number(a.isHub) || a.iata.localeCompare(b.iata));
}

export function estimateDurationMinutes(origin: StudioAirport, dest: StudioAirport): number {
  const R = 6371;
  const dLat = ((dest.lat - origin.lat) * Math.PI) / 180;
  const dLon = ((dest.lon - origin.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((dest.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(a));
  // Domestic jet ~650 km/h cruise + taxi buffer
  return Math.max(45, Math.round((km / 650) * 60 + 35));
}
