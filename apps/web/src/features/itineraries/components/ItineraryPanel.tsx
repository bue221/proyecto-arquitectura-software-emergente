"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock3, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  createItinerary,
  deleteItinerary,
  listItineraries,
  type Itinerary,
} from "@/features/itineraries/api";
import { cn } from "@/lib/utils";

const emptyForm = {
  originAirportId: "1",
  destinationAirportId: "2",
  travelDate: "",
  durationMinutes: 90,
};

export function ItineraryPanel() {
  const { ready, isAuthenticated, profile } = useAuth();
  const [items, setItems] = useState<Itinerary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const data = await listItineraries(profile?.subject);
    setItems(data);
  }, [profile?.subject]);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load itineraries");
    });
  }, [ready, isAuthenticated, refresh]);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-card">
        <h2 className="font-display text-3xl tracking-tight">Iniciá sesión para guardar viajes</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          El Gateway protege los itinerarios con JWT. Entrá con tu nombre y correo para crear y
          gestionar rutas.
        </p>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "default" }), "mt-6 h-11 rounded-full px-6")}
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      await createItinerary({
        userName: profile.displayName,
        originAirportId: form.originAirportId,
        destinationAirportId: form.destinationAirportId,
        travelDate: form.travelDate,
        durationMinutes: Number(form.durationMinutes),
      });
      setForm((prev) => ({ ...prev, travelDate: "" }));
      await refresh();
      toast.success("Viaje creado");
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
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7"
      >
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">Nuevo itinerario</h2>
          <p className="text-sm text-muted-foreground">
            Viajero: <span className="font-medium text-foreground">{profile.displayName}</span> —
            usá ids del mapa (ej. 1 → 2).
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="originAirportId">Origen (airport id)</Label>
            <Input
              id="originAirportId"
              required
              value={form.originAirportId}
              onChange={(e) => setForm({ ...form, originAirportId: e.target.value })}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destinationAirportId">Destino (airport id)</Label>
            <Input
              id="destinationAirportId"
              required
              value={form.destinationAirportId}
              onChange={(e) => setForm({ ...form, destinationAirportId: e.target.value })}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="travelDate">Fecha</Label>
            <Input
              id="travelDate"
              required
              type="date"
              value={form.travelDate}
              onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="durationMinutes">Duración (min)</Label>
            <Input
              id="durationMinutes"
              required
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              className="h-12 rounded-xl"
            />
          </div>
        </div>
        <Button type="submit" disabled={busy} className="mt-5 h-12 rounded-xl px-8">
          {busy ? "Guardando…" : "Crear viaje"}
        </Button>
      </form>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Tus viajes</h2>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Todavía no tenés itinerarios. Creá el primero con ids del mapa.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-search"
              >
                <div className="h-28 bg-[linear-gradient(135deg,#fff0f4_0%,#f0f4ff_55%,#f7f7f7_100%)]" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">
                      {item.originAirportId} → {item.destinationAirportId}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.userName}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {item.travelDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      {item.durationMinutes} min
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <Link
                      href={`/trips/${item.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full",
                      )}
                    >
                      Ver y maleta
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      onClick={() => onDelete(item.id)}
                      aria-label="Eliminar viaje"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
