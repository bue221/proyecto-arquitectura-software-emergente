"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { fetchAirportsForMap, type PlotlyPoint } from "@/features/airports/api";
import {
  createItinerary,
  deleteItinerary,
  listItineraries,
  type Itinerary,
  type PlanItem,
} from "@/features/itineraries/api";
import { TripCard } from "@/features/itineraries/components/TripCard";
import {
  recommendationsForDestination,
  toSelectedPlanItems,
  type PlanRecommendation,
} from "@/features/itineraries/recommendations";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

const emptyForm = {
  originAirportId: "",
  destinationAirportId: "",
  travelDate: "",
  durationMinutes: 90,
};

export function ItineraryPanel() {
  const { ready, isAuthenticated, profile } = useAuth();
  const [items, setItems] = useState<Itinerary[]>([]);
  const [airports, setAirports] = useState<PlotlyPoint[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState<Step>(1);
  const [recs, setRecs] = useState<PlanRecommendation[]>([]);
  const [customPlan, setCustomPlan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const airportById = useMemo(() => {
    const map = new Map<string, PlotlyPoint>();
    airports.forEach((a) => map.set(a.id, a));
    return map;
  }, [airports]);

  const labelFor = useCallback(
    (id: string) => {
      const a = airportById.get(id);
      if (!a) return id;
      return a.iata && a.iata !== "N/A" ? a.iata : a.name.slice(0, 18);
    },
    [airportById],
  );

  const airportOptions = useMemo(
    () =>
      [...airports]
        .sort((a, b) => (a.iata || a.name).localeCompare(b.iata || b.name))
        .slice(0, 120),
    [airports],
  );

  const refresh = useCallback(async () => {
    const data = await listItineraries(profile?.subject);
    setItems(data);
  }, [profile?.subject]);

  useEffect(() => {
    fetchAirportsForMap()
      .then((data) => setAirports(data.points || []))
      .catch(() => setAirports([]));
  }, []);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load itineraries");
    });
  }, [ready, isAuthenticated, refresh]);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Iniciá sesión para guardar viajes
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          El Gateway protege los itinerarios con JWT. Entrá con tu nombre y correo.
        </p>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-6 h-11 rounded-full bg-emerald-600 px-6 hover:bg-emerald-500",
          )}
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  function goToPlans(e: FormEvent) {
    e.preventDefault();
    if (!form.originAirportId || !form.destinationAirportId || !form.travelDate) {
      toast.error("Completá origen, destino y fecha");
      return;
    }
    if (form.originAirportId === form.destinationAirportId) {
      toast.error("Origen y destino deben ser distintos");
      return;
    }
    const dest = airportById.get(form.destinationAirportId);
    const seed = recommendationsForDestination(dest?.text || dest?.name || "").map((r) => ({
      ...r,
      selected: false,
    }));
    setRecs(seed);
    setStep(2);
  }

  function toggleRec(id: string) {
    setRecs((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  }

  function addCustomPlan() {
    const title = customPlan.trim();
    if (!title) return;
    const item: PlanRecommendation = {
      id: `custom-${crypto.randomUUID()}`,
      title,
      description: "Plan personalizado",
      category: "custom",
      source: "custom",
      selected: true,
    };
    setRecs((prev) => [...prev, item]);
    setCustomPlan("");
  }

  async function onCreate(planItemsOverride?: PlanItem[]) {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      const planItems = planItemsOverride ?? toSelectedPlanItems(recs);
      await createItinerary({
        userName: profile.displayName,
        originAirportId: form.originAirportId,
        destinationAirportId: form.destinationAirportId,
        travelDate: form.travelDate,
        durationMinutes: Number(form.durationMinutes),
        planItems,
      });
      setForm(emptyForm);
      setRecs([]);
      setStep(1);
      await refresh();
      toast.success(planItems.length ? "Viaje creado con tus planes" : "Viaje creado");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create itinerary";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteItinerary(id);
      await refresh();
      toast.success("Viaje eliminado");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete itinerary";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 sm:px-7">
          <StepPill active={step === 1} label="1. Ruta" />
          <div className="h-px flex-1 bg-slate-200" />
          <StepPill active={step === 2} label="2. Planes" />
        </div>

        {step === 1 ? (
          <form onSubmit={goToPlans} className="space-y-5 p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Nuevo itinerario</h2>
              <p className="text-sm text-slate-500">
                Viajero: <span className="font-medium text-slate-800">{profile.displayName}</span>
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AirportSelect
                id="origin"
                label="Origen"
                value={form.originAirportId}
                options={airportOptions}
                onChange={(v) => setForm({ ...form, originAirportId: v })}
              />
              <AirportSelect
                id="destination"
                label="Destino"
                value={form.destinationAirportId}
                options={airportOptions}
                onChange={(v) => setForm({ ...form, destinationAirportId: v })}
              />
              <div className="grid gap-2">
                <Label htmlFor="travelDate">Fecha</Label>
                <Input
                  id="travelDate"
                  required
                  type="date"
                  value={form.travelDate}
                  onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationMinutes">Duración vuelo (min)</Label>
                <Input
                  id="durationMinutes"
                  required
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="h-12 rounded-2xl"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-12 rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-500"
            >
              Continuar a planes
              <ArrowRight className="size-4" />
            </Button>
          </form>
        ) : (
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  ¿Qué querés hacer en destino?
                </h2>
                <p className="text-sm text-slate-500">
                  Recomendaciones opcionales para {labelFor(form.destinationAirportId)}. Podés
                  saltar este paso.
                </p>
              </div>
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" />
                Volver
              </Button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {recs.map((rec) => (
                <li key={rec.id}>
                  <button
                    type="button"
                    onClick={() => toggleRec(rec.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:scale-[1.01]",
                      rec.selected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <Checkbox checked={Boolean(rec.selected)} tabIndex={-1} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{rec.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{rec.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <Input
                value={customPlan}
                onChange={(e) => setCustomPlan(e.target.value)}
                placeholder="Agregar plan propio…"
                className="h-11 rounded-2xl"
              />
              <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={addCustomPlan}>
                <Plus className="size-4" />
                Añadir
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={busy}
                onClick={() => void onCreate()}
                className="h-12 rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-500"
              >
                {busy ? "Guardando…" : "Crear viaje"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                className="h-12 rounded-2xl"
                onClick={() => void onCreate([])}
              >
                Saltar planes y crear
              </Button>
            </div>
          </div>
        )}
      </section>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-slate-900">Tus viajes</h2>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
            Todavía no tenés itinerarios. Creá el primero en dos pasos.
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <TripCard
                key={item.id}
                item={item}
                index={index}
                originLabel={labelFor(item.originAirportId)}
                destinationLabel={labelFor(item.destinationAirportId)}
                busy={busy}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500",
      )}
    >
      {label}
    </span>
  );
}

function AirportSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: PlotlyPoint[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
      >
        <option value="">Elegí aeropuerto…</option>
        {options.map((a) => (
          <option key={a.id} value={a.id}>
            {(a.iata && a.iata !== "N/A" ? a.iata : a.id) + " — " + a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
