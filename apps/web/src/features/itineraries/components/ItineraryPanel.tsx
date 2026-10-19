"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  createItinerary,
  deleteItinerary,
  listItineraries,
  type Itinerary,
} from "@/features/itineraries/api";

const emptyForm = {
  userName: "",
  originAirportId: "1",
  destinationAirportId: "2",
  travelDate: "",
  durationMinutes: 90,
};

export function ItineraryPanel() {
  const [items, setItems] = useState<Itinerary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const data = await listItineraries();
    setItems(data);
  }, []);

  useEffect(() => {
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load itineraries");
    });
  }, [refresh]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createItinerary({
        userName: form.userName,
        originAirportId: form.originAirportId,
        destinationAirportId: form.destinationAirportId,
        travelDate: form.travelDate,
        durationMinutes: Number(form.durationMinutes),
      });
      setForm((prev) => ({ ...prev, userName: "" }));
      await refresh();
      toast.success("Itinerary created");
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
      toast.success("Itinerary deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete itinerary";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Your itineraries</CardTitle>
        <CardDescription>
          Creates validate airports through Itinerary Service → Airport Service (HTTP).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="userName">Traveler name</Label>
            <Input
              id="userName"
              required
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="travelDate">Travel date</Label>
            <Input
              id="travelDate"
              required
              type="date"
              value={form.travelDate}
              onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="originAirportId">Origin airport ID</Label>
            <Input
              id="originAirportId"
              required
              value={form.originAirportId}
              onChange={(e) => setForm({ ...form, originAirportId: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destinationAirportId">Destination airport ID</Label>
            <Input
              id="destinationAirportId"
              required
              value={form.destinationAirportId}
              onChange={(e) => setForm({ ...form, destinationAirportId: e.target.value })}
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              required
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            />
          </div>
          <Button type="submit" disabled={busy} className="md:col-span-2">
            {busy ? "Saving…" : "Create itinerary"}
          </Button>
        </form>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Separator />

        <ul className="space-y-2">
          {items.length === 0 ? (
            <li className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
              No itineraries yet. Create one using airport IDs from the map (e.g. 1 → 2).
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{item.userName}</p>
                  <p className="text-muted-foreground">
                    {item.originAirportId} → {item.destinationAirportId} · {item.travelDate} ·{" "}
                    {item.durationMinutes} min
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
