"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPinned, Sparkles, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cardStyleFor } from "@/features/itineraries/cardStyles";
import type { Itinerary } from "@/features/itineraries/api";
import { cn } from "@/lib/utils";

type TripCardProps = {
  item: Itinerary;
  index: number;
  originLabel: string;
  destinationLabel: string;
  busy?: boolean;
  onDelete: (id: string) => void;
};

export function TripCard({
  item,
  index,
  originLabel,
  destinationLabel,
  busy,
  onDelete,
}: TripCardProps) {
  const style = cardStyleFor(item.id, index);
  const plans = (item.planItems || []).filter((p) => p.selected).slice(0, 3);

  return (
    <li
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
      )}
    >
      <div className={cn("relative h-32 overflow-hidden", style.hero)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.45),transparent_45%)]" />
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            style.badge,
          )}
        >
          {style.id}
        </span>
        <MapPinned className="absolute bottom-4 right-4 size-10 text-white/50" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xl font-extrabold tracking-tight text-slate-900">
            {originLabel} <span className="text-slate-400">→</span> {destinationLabel}
          </p>
          <p className="text-sm text-slate-500">{item.userName}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {item.travelDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {item.durationMinutes} min
          </span>
        </div>

        {plans.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
              >
                <Sparkles className={cn("size-3", style.accent)} />
                {plan.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">Sin planes aún — abrí el detalle para armarlos.</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Link
            href={`/trips/${item.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
          >
            Ver maleta y planes
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
  );
}
