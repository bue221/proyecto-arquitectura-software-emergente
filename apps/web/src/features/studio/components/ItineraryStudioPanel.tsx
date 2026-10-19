"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, Plane, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { createItinerary } from "@/features/itineraries/api";
import type { StudioAirport } from "@/features/studio/airports";
import { estimateDurationMinutes } from "@/features/studio/airports";
import { AirportCombobox } from "@/features/studio/components/AirportCombobox";
import { cn } from "@/lib/utils";

type ItineraryStudioPanelProps = {
  airports: StudioAirport[];
  origin: StudioAirport | null;
  destination: StudioAirport | null;
  onOriginChange: (airport: StudioAirport) => void;
  onDestinationChange: (airport: StudioAirport) => void;
  onSwap: () => void;
  onClear: () => void;
};

export function ItineraryStudioPanel({
  airports,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onClear,
}: ItineraryStudioPanelProps) {
  const { isAuthenticated, profile } = useAuth();
  const [travelDate, setTravelDate] = useState("");
  const [busy, setBusy] = useState(false);

  const duration = useMemo(() => {
    if (!origin || !destination) return null;
    return estimateDurationMinutes(origin, destination);
  }, [origin, destination]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !travelDate) {
      toast.error("Elegí origen, destino y fecha");
      return;
    }
    if (!isAuthenticated || !profile) {
      toast.message("Iniciá sesión para guardar el itinerario");
      return;
    }
    if (origin.id === destination.id) {
      toast.error("Origen y destino deben ser distintos");
      return;
    }
    setBusy(true);
    try {
      const created = await createItinerary({
        userName: profile.displayName,
        originAirportId: origin.id,
        destinationAirportId: destination.id,
        travelDate,
        durationMinutes: duration || 90,
      });
      toast.success("Itinerario creado — abrí la maleta");
      window.location.href = `/trips/${created.id}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el viaje");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="glass-panel absolute inset-x-3 bottom-3 z-20 flex max-h-[58vh] flex-col overflow-hidden rounded-3xl border border-white/60 md:inset-y-20 md:right-5 md:left-auto md:bottom-5 md:max-h-none md:w-[400px]"
    >
      <div className="border-b border-slate-200/80 px-5 py-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <Sparkles className="size-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Itinerary studio
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Armá tu ruta en el mapa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tocá dos aeropuertos o buscá por código IATA. La ruta se dibuja sola.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          <AirportCombobox
            label="Origen"
            value={origin}
            airports={airports}
            excludeId={destination?.id}
            onChange={onOriginChange}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-slate-200"
              onClick={onSwap}
              disabled={!origin && !destination}
              aria-label="Intercambiar origen y destino"
            >
              <ArrowRightLeft className="size-4" />
            </Button>
          </div>
          <AirportCombobox
            label="Destino"
            value={destination}
            airports={airports}
            excludeId={origin?.id}
            onChange={onDestinationChange}
          />
        </div>

        <AnimatePresence mode="wait">
          {origin && destination ? (
            <motion.div
              key={`${origin.id}-${destination.id}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="bg-gradient-to-r from-emerald-50 via-white to-indigo-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                      {origin.iata}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{origin.city}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center px-2">
                    <Plane className="size-4 text-indigo-600" />
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        className="h-full rounded-full bg-indigo-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.1, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-slate-500">
                      {duration} min est.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                      {destination.iata}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{destination.city}</p>
                  </div>
                </div>
              </div>

              <ol className="relative space-y-4 border-t border-slate-100 px-4 py-4">
                <TimelineStep
                  title="Salida"
                  subtitle={`${origin.name}`}
                  tone="emerald"
                />
                <TimelineStep
                  title="En vuelo"
                  subtitle={`Duración estimada ${duration} minutos`}
                  tone="indigo"
                />
                <TimelineStep
                  title="Llegada"
                  subtitle={`${destination.name}`}
                  tone="emerald"
                  last
                />
              </ol>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500"
            >
              Seleccioná origen y destino en el mapa para ver la timeline.
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="travelDate" className="text-[11px] uppercase tracking-[0.14em]">
              Fecha de viaje
            </Label>
            <Input
              id="travelDate"
              type="date"
              required
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="h-12 rounded-2xl border-slate-200"
            />
          </div>

          {isAuthenticated ? (
            <Button
              type="submit"
              disabled={busy || !origin || !destination}
              className="h-12 w-full rounded-2xl bg-emerald-600 text-base font-semibold hover:bg-emerald-500"
            >
              {busy ? "Guardando…" : "Guardar itinerario"}
            </Button>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 text-base font-semibold hover:bg-emerald-500",
              )}
            >
              Iniciar sesión para guardar
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-2xl text-slate-500"
            onClick={onClear}
          >
            Limpiar selección
          </Button>
        </form>
      </div>
    </motion.aside>
  );
}

function TimelineStep({
  title,
  subtitle,
  tone,
  last = false,
}: {
  title: string;
  subtitle: string;
  tone: "emerald" | "indigo";
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-3 pl-1">
      {!last ? (
        <span className="absolute left-[7px] top-4 h-[calc(100%+8px)] w-px bg-slate-200" />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-1 size-3.5 shrink-0 rounded-full ring-4 ring-white",
          tone === "emerald" ? "bg-emerald-500" : "bg-indigo-600",
        )}
      />
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </li>
  );
}
