import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { ItineraryPanel } from "@/features/itineraries/components/ItineraryPanel";

export const metadata: Metadata = {
  title: "Mis viajes",
  description:
    "Creá itinerarios en dos pasos: ruta entre aeropuertos colombianos y planes recomendados en destino, con checklist de maleta.",
  openGraph: {
    title: "Mis viajes · RutaCO",
    description: "Wizard de itinerarios con recomendaciones y cards visuales únicas.",
  },
};

export default function TripsPage() {
  return (
    <AppShell>
      <header className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Viajes</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Tus itinerarios
        </h1>
        <p className="max-w-2xl text-slate-500">
          Paso 1: origen, destino y fecha. Paso 2: elegí (o saltá) planes recomendados para el
          destino. Después abrí cada viaje para la maleta.
        </p>
      </header>
      <ItineraryPanel />
    </AppShell>
  );
}
