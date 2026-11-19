import { describe, expect, it } from "vitest";

import {
  recommendationsForDestination,
  toSelectedPlanItems,
} from "@/features/itineraries/recommendations";

describe("recommendationsForDestination", () => {
  it("always includes the shared base catalog", () => {
    const recs = recommendationsForDestination("Manizales");
    expect(recs.some((r) => r.id === "rec-food")).toBe(true);
    expect(recs.some((r) => r.id === "rec-culture")).toBe(true);
  });

  it("merges city-specific extras for Bogotá", () => {
    const recs = recommendationsForDestination("Bogotá / El Dorado");
    expect(recs.some((r) => r.id === "rec-bog-monserrate")).toBe(true);
  });

  it("deduplicates by id", () => {
    const ids = recommendationsForDestination("Medellín").map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("toSelectedPlanItems", () => {
  it("keeps only selected recommendations as plan items", () => {
    const items = toSelectedPlanItems([
      {
        id: "rec-food",
        title: "Food",
        description: "x",
        category: "food",
        source: "recommendation",
        selected: true,
      },
      {
        id: "rec-photo",
        title: "Photo",
        description: "y",
        category: "photo",
        source: "recommendation",
        selected: false,
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "rec-food", selected: true });
  });
});
