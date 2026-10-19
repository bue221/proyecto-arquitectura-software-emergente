import { ensureAccessToken } from "@/lib/api/auth";
import { getJson, sendJson } from "@/lib/api/http";

export type PackingItem = {
  id: string;
  label: string;
  packed: boolean;
  category?: string;
};

export type PlanItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  selected: boolean;
  source?: string;
};

export type Itinerary = {
  id: string;
  userName: string;
  originAirportId: string;
  destinationAirportId: string;
  travelDate: string;
  durationMinutes: number;
  packingItems: PackingItem[];
  planItems: PlanItem[];
  createdAt: string;
  updatedAt: string;
};

export type ItineraryInput = {
  userName: string;
  originAirportId: string;
  destinationAirportId: string;
  travelDate: string;
  durationMinutes: number;
  packingItems?: PackingItem[];
  planItems?: PlanItem[];
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

export async function listItineraries(subjectHint?: string): Promise<Itinerary[]> {
  const data = await getJson<{ items: Itinerary[] }>(`${apiBase()}/api/v1/itineraries`, {
    headers: await authHeaders(subjectHint),
  });
  return (data.items || []).map(normalizeItinerary);
}

export async function getItinerary(id: string, subjectHint?: string): Promise<Itinerary> {
  const item = await getJson<Itinerary>(`${apiBase()}/api/v1/itineraries/${id}`, {
    headers: await authHeaders(subjectHint),
  });
  return normalizeItinerary(item);
}

export async function createItinerary(input: ItineraryInput): Promise<Itinerary> {
  return normalizeItinerary(
    (await sendJson<Itinerary>(`${apiBase()}/api/v1/itineraries`, "POST", input, {
      headers: await authHeaders(input.userName || "demo-traveler"),
    })) as Itinerary,
  );
}

export async function updateItinerary(
  id: string,
  input: ItineraryInput,
  subjectHint?: string,
): Promise<Itinerary> {
  return normalizeItinerary(
    (await sendJson<Itinerary>(`${apiBase()}/api/v1/itineraries/${id}`, "PUT", input, {
      headers: await authHeaders(subjectHint || input.userName || "demo-traveler"),
    })) as Itinerary,
  );
}

export async function deleteItinerary(id: string): Promise<void> {
  await sendJson(`${apiBase()}/api/v1/itineraries/${id}`, "DELETE", undefined, {
    headers: await authHeaders(),
  });
}

function normalizeItinerary(item: Itinerary): Itinerary {
  return {
    ...item,
    packingItems: item.packingItems || [],
    planItems: item.planItems || [],
  };
}
