import type { PlanItem } from "@/features/itineraries/api";

export type PlanRecommendation = Omit<PlanItem, "selected"> & {
  selected?: boolean;
};

const BASE: PlanRecommendation[] = [
  {
    id: "rec-food",
    title: "Ruta gastronómica local",
    description: "Mercado + plato típico + café de especialidad",
    category: "food",
    source: "recommendation",
  },
  {
    id: "rec-culture",
    title: "Museo o centro histórico",
    description: "Un recorrido corto por patrimonio y arquitectura",
    category: "culture",
    source: "recommendation",
  },
  {
    id: "rec-nature",
    title: "Naturaleza cercana",
    description: "Parque, mirador o caminata corta fuera del aeropuerto",
    category: "nature",
    source: "recommendation",
  },
  {
    id: "rec-photo",
    title: "Spot fotográfico",
    description: "Un lugar emblemático para fotos del viaje",
    category: "photo",
    source: "recommendation",
  },
];

const BY_CITY: Record<string, PlanRecommendation[]> = {
  bogotá: [
    {
      id: "rec-bog-monserrate",
      title: "Monserrate o Mirador",
      description: "Vista de la ciudad si el clima acompaña",
      category: "nature",
      source: "recommendation",
    },
    {
      id: "rec-bog-cafe",
      title: "Café de origen",
      description: "Catación o tienda de café especialidad",
      category: "food",
      source: "recommendation",
    },
  ],
  medellín: [
    {
      id: "rec-mde-comuna",
      title: "Comuna 13 / arte urbano",
      description: "Grafiti tour o miradores del MetroCable",
      category: "culture",
      source: "recommendation",
    },
  ],
  cartagena: [
    {
      id: "rec-ctg-walled",
      title: "Ciudad Amurallada",
      description: "Atardecer en las murallas y calles del centro",
      category: "culture",
      source: "recommendation",
    },
    {
      id: "rec-ctg-beach",
      title: "Playa cercana",
      description: "Bocagrande o day-trip a islas (si hay tiempo)",
      category: "beach",
      source: "recommendation",
    },
  ],
  cali: [
    {
      id: "rec-clo-salsa",
      title: "Noche de salsa",
      description: "Escuela o sala clásica de salsa caleña",
      category: "nightlife",
      source: "recommendation",
    },
  ],
  barranquilla: [
    {
      id: "rec-baq-carnaval",
      title: "Museo del Carnaval",
      description: "Cultura costeña y tradiciones",
      category: "culture",
      source: "recommendation",
    },
  ],
  pereira: [
    {
      id: "rec-pei-eje",
      title: "Paisaje cafetero",
      description: "Finca cercana o mirador del Eje",
      category: "nature",
      source: "recommendation",
    },
  ],
};

export function recommendationsForDestination(cityOrName: string): PlanRecommendation[] {
  const key = cityOrName.trim().toLowerCase();
  const extras = Object.entries(BY_CITY).find(([city]) => key.includes(city))?.[1] || [];
  const merged = [...BASE, ...extras];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function toSelectedPlanItems(recs: PlanRecommendation[]): PlanItem[] {
  return recs
    .filter((r) => r.selected)
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      selected: true,
      source: r.source || "recommendation",
    }));
}
