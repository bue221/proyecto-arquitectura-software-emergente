import { getJson, sendJson } from "@/lib/api/http";

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

export async function listItineraries(): Promise<Itinerary[]> {
  const data = await getJson<{ items: Itinerary[] }>(`${apiBase()}/api/v1/itineraries`);
  return data.items || [];
}

export async function createItinerary(input: ItineraryInput): Promise<Itinerary> {
  return (await sendJson<Itinerary>(`${apiBase()}/api/v1/itineraries`, "POST", input)) as Itinerary;
}

export async function deleteItinerary(id: string): Promise<void> {
  await sendJson(`${apiBase()}/api/v1/itineraries/${id}`, "DELETE");
}
