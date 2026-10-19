import { getJson } from "@/lib/api/http";

export type PlotlyPoint = {
  id: string;
  name: string;
  iata: string;
  lat: number;
  lon: number;
  text: string;
};

export type AirportsMapResponse = {
  count: number;
  points: PlotlyPoint[];
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_AIRPORT_API_URL?.replace(/\/$/, "") || "http://localhost:8081";
}

export async function fetchAirportsForMap(): Promise<AirportsMapResponse> {
  return getJson<AirportsMapResponse>(`${apiBase()}/api/v1/airports`);
}
