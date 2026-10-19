"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Luggage } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { getItinerary, type Itinerary } from "@/features/itineraries/api";
import { cn } from "@/lib/utils";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, isAuthenticated, profile } = useAuth();
  const [item, setItem] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    getItinerary(params.id, profile?.subject)
      .then(setItem)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "No se pudo cargar el viaje");
      });
  }, [ready, isAuthenticated, params.id, profile?.subject, router]);

  return (
    <AppShell>
      <Link
        href="/trips"
        className={cn(buttonVariants({ variant: "ghost" }), "mb-6 gap-2 rounded-full px-3")}
      >
        <ArrowLeft className="size-4" />
        Volver a viajes
      </Link>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !item ? (
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="h-36 bg-[linear-gradient(135deg,#fff0f4_0%,#eef2ff_50%,#f7f7f7_100%)]" />
            <div className="space-y-2 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Itinerario
              </p>
              <h1 className="font-display text-4xl tracking-tight">
                {item.originAirportId} → {item.destinationAirportId}
              </h1>
              <p className="text-muted-foreground">
                {item.userName} · {item.travelDate} · {item.durationMinutes} min
              </p>
            </div>
          </div>

          <section className="rounded-3xl border border-dashed border-border bg-card p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-3">
              <Luggage className="mt-1 size-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Checklist de maleta</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Próximo PR: ítems persistidos en el Itinerary Service (documentos, ropa,
                  electronics…). Esta pantalla ya está lista para enchufar el checklist.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
