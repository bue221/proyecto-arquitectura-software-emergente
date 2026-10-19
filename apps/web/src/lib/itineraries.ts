export type Itinerary = {
  id: string;
  userName: string;
  originAirportId: string;
  destinationAirportId: string;
  travelDate: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type ItineraryInput = {
  userName: string;
  originAirportId: string;
  destinationAirportId: string;
  travelDate: string;
  durationMinutes: number;
};

function apiBase(): string {
  return (
    process.env.NEXT_PUBLIC_ITINERARY_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8082"
  );
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; code?: string };
    return body.message || body.code || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function listItineraries(): Promise<Itinerary[]> {
  const res = await fetch(`${apiBase()}/api/v1/itineraries`, { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { items: Itinerary[] };
  return data.items || [];
}

export async function createItinerary(input: ItineraryInput): Promise<Itinerary> {
  const res = await fetch(`${apiBase()}/api/v1/itineraries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Itinerary;
}

export async function deleteItinerary(id: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/v1/itineraries/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
}
