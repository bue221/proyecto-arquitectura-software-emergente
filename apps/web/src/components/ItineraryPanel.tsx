"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import {
  createItinerary,
  deleteItinerary,
  listItineraries,
  type Itinerary,
} from "@/lib/itineraries";

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create itinerary");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete itinerary");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-[#16324f]">Your itineraries</h2>
        <p className="text-sm text-[#4a5d73]">
          Creates validate airports through Itinerary Service → Airport Service (HTTP).
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-xl border border-[#d7e0ea] bg-white/80 p-4 shadow-[0_12px_40px_rgba(22,50,79,0.06)] md:grid-cols-2"
      >
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[#16324f]">Traveler name</span>
          <input
            required
            className="rounded-md border border-[#c9d6e4] px-3 py-2"
            value={form.userName}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[#16324f]">Travel date</span>
          <input
            required
            type="date"
            className="rounded-md border border-[#c9d6e4] px-3 py-2"
            value={form.travelDate}
            onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[#16324f]">Origin airport ID</span>
          <input
            required
            className="rounded-md border border-[#c9d6e4] px-3 py-2"
            value={form.originAirportId}
            onChange={(e) => setForm({ ...form, originAirportId: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[#16324f]">Destination airport ID</span>
          <input
            required
            className="rounded-md border border-[#c9d6e4] px-3 py-2"
            value={form.destinationAirportId}
            onChange={(e) => setForm({ ...form, destinationAirportId: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-medium text-[#16324f]">Duration (minutes)</span>
          <input
            required
            type="number"
            min={1}
            className="rounded-md border border-[#c9d6e4] px-3 py-2"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="md:col-span-2 rounded-md bg-[#0f6a5d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c564b] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Create itinerary"}
        </button>
      </form>

      {error ? (
        <div role="alert" className="rounded-lg border border-[#f0c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#8a2f2f]">
          {error}
        </div>
      ) : null}

      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[#c9d6e4] px-4 py-6 text-sm text-[#4a5d73]">
            No itineraries yet. Create one using airport IDs from the map (e.g. 1 → 2).
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d7e0ea] bg-white/90 px-4 py-3"
            >
              <div className="text-sm text-[#16324f]">
                <p className="font-semibold">{item.userName}</p>
                <p className="text-[#4a5d73]">
                  {item.originAirportId} → {item.destinationAirportId} · {item.travelDate} ·{" "}
                  {item.durationMinutes} min
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete(item.id)}
                className="rounded-md border border-[#d7e0ea] px-3 py-1.5 text-xs font-semibold text-[#8a2f2f] hover:bg-[#fff5f5]"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
