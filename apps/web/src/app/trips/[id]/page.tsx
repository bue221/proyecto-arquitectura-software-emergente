"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { getItinerary, type Itinerary } from "@/features/itineraries/api";
import { PackingChecklist } from "@/features/itineraries/components/PackingChecklist";
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

  const selectedPlans = (item?.planItems || []).filter((p) => p.selected);

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
        <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-36 bg-[linear-gradient(135deg,#ecfdf5_0%,#e0e7ff_50%,#f8fafc_100%)]" />
            <div className="space-y-2 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Itinerario
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                {item.originAirportId} → {item.destinationAirportId}
              </h1>
              <p className="text-slate-500">
                {item.userName} · {item.travelDate} · {item.durationMinutes} min
              </p>
            </div>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">Planes en destino</h2>
            </div>
            {selectedPlans.length === 0 ? (
              <p className="text-sm text-slate-500">
                No agregaste planes en la creación. Podés crear otro viaje e incluir
                recomendaciones en el paso 2.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {selectedPlans.map((plan) => (
                  <li
                    key={plan.id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
                    {plan.description ? (
                      <p className="mt-1 text-xs text-slate-600">{plan.description}</p>
                    ) : null}
                    {plan.category ? (
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {plan.category}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <PackingChecklist
            itinerary={item}
            subjectHint={profile?.subject}
            onUpdated={setItem}
          />
        </div>
      )}
    </AppShell>
  );
}
