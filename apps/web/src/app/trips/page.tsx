import { AppShell } from "@/components/layout/AppShell";
import { ItineraryPanel } from "@/features/itineraries/components/ItineraryPanel";

export default function TripsPage() {
  return (
    <AppShell>
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Viajes</p>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Tus itinerarios</h1>
        <p className="max-w-2xl text-muted-foreground">
          Creá rutas entre aeropuertos y abrí cada viaje para armar el checklist de maleta.
        </p>
      </div>
      <ItineraryPanel />
    </AppShell>
  );
}
