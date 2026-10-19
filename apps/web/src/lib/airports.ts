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

export type AirportProblem = {
  code: string;
  message: string;
  trace_id?: string;
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_AIRPORT_API_URL?.replace(/\/$/, "") || "http://localhost:8081";
}

export async function fetchAirportsForMap(): Promise<AirportsMapResponse> {
  const res = await fetch(`${apiBase()}/api/v1/airports`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    let problem: AirportProblem | null = null;
    try {
      problem = (await res.json()) as AirportProblem;
    } catch {
      // ignore parse errors
    }
    const message = problem?.message || `Airport API failed with status ${res.status}`;
    throw new Error(message);
  }

  return (await res.json()) as AirportsMapResponse;
}
