import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AirportMap } from "@/features/airports/components/AirportMap";
import { ItineraryPanel } from "@/features/itineraries/components/ItineraryPanel";

export default function HomePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Personal Itineraries"
        title="Plan trips on a trusted Colombian airport map"
        description="Next.js talks to Airport and Itinerary services only — never to API Colombia."
      />
      <AirportMap />
      <ItineraryPanel />
    </AppShell>
  );
}
