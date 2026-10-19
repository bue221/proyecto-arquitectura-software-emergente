import { AirportMap } from "@/components/AirportMap";
import { ItineraryPanel } from "@/components/ItineraryPanel";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#d9f2ea_0%,transparent_42%),radial-gradient(circle_at_80%_0%,#d7e8f8_0%,transparent_40%),linear-gradient(180deg,#f7fafc_0%,#eef3f7_100%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f6a5d]">
            Personal Itineraries
          </p>
          <h1 className="font-display text-4xl leading-tight text-[#16324f] md:text-5xl">
            Plan trips on a trusted Colombian airport map
          </h1>
          <p className="text-base text-[#4a5d73] md:text-lg">
            Next.js talks to Airport and Itinerary services only — never to API Colombia.
          </p>
        </header>

        <AirportMap />
        <ItineraryPanel />
      </div>
    </main>
  );
}
