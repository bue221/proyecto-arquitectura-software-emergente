export type TripCardStyle = {
  id: string;
  hero: string;
  badge: string;
  accent: string;
};

const STYLES: TripCardStyle[] = [
  {
    id: "emerald",
    hero: "bg-[linear-gradient(135deg,#ecfdf5_0%,#a7f3d0_45%,#34d399_100%)]",
    badge: "bg-emerald-700 text-white",
    accent: "text-emerald-700",
  },
  {
    id: "indigo",
    hero: "bg-[linear-gradient(135deg,#eef2ff_0%,#c7d2fe_50%,#818cf8_100%)]",
    badge: "bg-indigo-700 text-white",
    accent: "text-indigo-700",
  },
  {
    id: "sunset",
    hero: "bg-[linear-gradient(135deg,#fff7ed_0%,#fdba74_48%,#fb7185_100%)]",
    badge: "bg-orange-700 text-white",
    accent: "text-orange-700",
  },
  {
    id: "ocean",
    hero: "bg-[linear-gradient(135deg,#f0f9ff_0%,#7dd3fc_50%,#38bdf8_100%)]",
    badge: "bg-sky-700 text-white",
    accent: "text-sky-700",
  },
  {
    id: "forest",
    hero: "bg-[linear-gradient(135deg,#f7fee7_0%,#bef264_45%,#4ade80_100%)]",
    badge: "bg-lime-800 text-white",
    accent: "text-lime-800",
  },
  {
    id: "slate",
    hero: "bg-[linear-gradient(135deg,#f8fafc_0%,#cbd5e1_55%,#64748b_100%)]",
    badge: "bg-slate-800 text-white",
    accent: "text-slate-800",
  },
];

export function cardStyleFor(id: string, index: number): TripCardStyle {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % 997;
  return STYLES[(hash + index) % STYLES.length];
}
