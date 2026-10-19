"use client";

import { Layers } from "lucide-react";

import type { MapTileProviderId, MapTileStyle } from "@/features/studio/map/port";
import { cn } from "@/lib/utils";

type TileProviderSwitchProps = {
  styles: MapTileStyle[];
  activeId: MapTileProviderId;
  onChange: (id: MapTileProviderId) => void;
};

export function TileProviderSwitch({ styles, activeId, onChange }: TileProviderSwitchProps) {
  return (
    <div className="pointer-events-auto rounded-2xl border border-white/70 bg-white/85 p-2 shadow-sm backdrop-blur">
      <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <Layers className="size-3" />
        Basemap (adapter)
      </div>
      <div className="flex flex-col gap-1">
        {styles.map((style) => {
          const active = style.id === activeId;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={cn(
                "rounded-xl px-2.5 py-1.5 text-left transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
              title={style.description}
            >
              <span className="block text-xs font-semibold">{style.label}</span>
              <span
                className={cn(
                  "block text-[10px]",
                  active ? "text-slate-300" : "text-slate-500",
                )}
              >
                {style.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
