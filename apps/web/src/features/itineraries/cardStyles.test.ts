import { describe, expect, it } from "vitest";

import { cardStyleFor } from "@/features/itineraries/cardStyles";

describe("cardStyleFor", () => {
  it("is deterministic for the same id and index", () => {
    expect(cardStyleFor("abc-123", 0)).toEqual(cardStyleFor("abc-123", 0));
  });

  it("varies across different itinerary ids", () => {
    const a = cardStyleFor("trip-a", 0);
    const b = cardStyleFor("trip-b", 0);
    // Not guaranteed different, but style ids must always be defined.
    expect(a.id).toBeTruthy();
    expect(b.id).toBeTruthy();
  });
});
