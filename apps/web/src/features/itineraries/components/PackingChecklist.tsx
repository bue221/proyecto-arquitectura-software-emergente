"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { updateItinerary, type Itinerary, type PackingItem } from "@/features/itineraries/api";

type PackingChecklistProps = {
  itinerary: Itinerary;
  subjectHint?: string;
  onUpdated: (next: Itinerary) => void;
};

export function PackingChecklist({ itinerary, subjectHint, onUpdated }: PackingChecklistProps) {
  const [items, setItems] = useState<PackingItem[]>(itinerary.packingItems || []);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setItems(itinerary.packingItems || []);
  }, [itinerary.id, itinerary.updatedAt, itinerary.packingItems]);

  async function persist(next: PackingItem[]) {
    setBusy(true);
    try {
      const updated = await updateItinerary(
        itinerary.id,
        {
          userName: itinerary.userName,
          originAirportId: itinerary.originAirportId,
          destinationAirportId: itinerary.destinationAirportId,
          travelDate: itinerary.travelDate,
          durationMinutes: itinerary.durationMinutes,
          packingItems: next,
          planItems: itinerary.planItems || [],
        },
        subjectHint,
      );
      setItems(updated.packingItems || []);
      onUpdated(updated);
      toast.success("Maleta actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la maleta");
    } finally {
      setBusy(false);
    }
  }

  async function togglePacked(id: string, packed: boolean) {
    const next = items.map((item) => (item.id === id ? { ...item, packed } : item));
    setItems(next);
    await persist(next);
  }

  async function removeItem(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    await persist(next);
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const label = draft.trim();
    if (!label) return;
    const next = [
      ...items,
      {
        id: `local-${crypto.randomUUID()}`,
        label,
        packed: false,
        category: "custom",
      },
    ];
    setDraft("");
    setItems(next);
    await persist(next);
  }

  const packedCount = items.filter((i) => i.packed).length;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Checklist de maleta</h2>
          <p className="text-sm text-muted-foreground">
            {packedCount}/{items.length} listos · se guarda en el Itinerary Service
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-border px-3 py-2.5"
          >
            <Checkbox
              checked={item.packed}
              disabled={busy}
              onCheckedChange={(checked) => togglePacked(item.id, Boolean(checked))}
              aria-label={`Marcar ${item.label}`}
            />
            <span
              className={
                item.packed
                  ? "flex-1 text-sm text-muted-foreground line-through"
                  : "flex-1 text-sm font-medium"
              }
            >
              {item.label}
            </span>
            {item.category ? (
              <span className="hidden text-[11px] uppercase tracking-wide text-muted-foreground sm:inline">
                {item.category}
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              onClick={() => removeItem(item.id)}
              aria-label={`Quitar ${item.label}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={onAdd} className="mt-4 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Agregar algo a la maleta…"
          className="h-11 rounded-xl"
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !draft.trim()} className="h-11 rounded-xl px-4">
          <Plus className="size-4" />
          Añadir
        </Button>
      </form>
    </section>
  );
}
