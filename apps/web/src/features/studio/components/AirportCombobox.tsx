"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { StudioAirport } from "@/features/studio/airports";
import { cn } from "@/lib/utils";

type AirportComboboxProps = {
  label: string;
  value: StudioAirport | null;
  airports: StudioAirport[];
  excludeId?: string | null;
  onChange: (airport: StudioAirport) => void;
  placeholder?: string;
};

export function AirportCombobox({
  label,
  value,
  airports,
  excludeId,
  onChange,
  placeholder = "Buscar código o ciudad…",
}: AirportComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return airports
      .filter((a) => a.id !== excludeId)
      .filter((a) => {
        if (!q) return a.isHub;
        return (
          a.iata.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [airports, excludeId, query]);

  return (
    <div className="relative">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15",
          open && "border-emerald-500 ring-4 ring-emerald-500/15",
        )}
      >
        <Search className="size-4 shrink-0 text-slate-400" />
        <input
          value={open ? query : value ? `${value.iata} · ${value.city}` : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onBlur={() => {
            // Delay so click on option registers
            window.setTimeout(() => setOpen(false), 140);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
        {value ? (
          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-white">
            {value.iata}
          </span>
        ) : null}
      </div>

      {open ? (
        <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Sin resultados</li>
          ) : (
            filtered.map((airport) => (
              <li key={airport.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(airport);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="w-12 text-sm font-extrabold tracking-wide text-slate-900">
                    {airport.iata}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {airport.city}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{airport.name}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
