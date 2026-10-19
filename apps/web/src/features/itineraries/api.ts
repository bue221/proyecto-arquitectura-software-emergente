import { ensureAccessToken } from "@/lib/api/auth";
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
    process.env.NEXT_PUBLIC_API_GATEWAY_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_ITINERARY_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  );
}

async function authHeaders(subjectHint?: string): Promise<HeadersInit> {
  const token = await ensureAccessToken(subjectHint || "demo-traveler");
  return { Authorization: `Bearer ${token}` };
}

export async function listItineraries(): Promise<Itinerary[]> {
  const data = await getJson<{ items: Itinerary[] }>(`${apiBase()}/api/v1/itineraries`, {
    headers: await authHeaders(),
  });
  return data.items || [];
}

export async function createItinerary(input: ItineraryInput): Promise<Itinerary> {
  return (await sendJson<Itinerary>(
    `${apiBase()}/api/v1/itineraries`,
    "POST",
    input,
    { headers: await authHeaders(input.userName || "demo-traveler") },
  )) as Itinerary;
}

export async function deleteItinerary(id: string): Promise<void> {
  await sendJson(`${apiBase()}/api/v1/itineraries/${id}`, "DELETE", undefined, {
    headers: await authHeaders(),
  });
}
