import { describe, expect, it } from "vitest";
import { catalog, catalogIssues } from "./catalog";

describe("catalog integrity", () => {
  it("has no validation issues", () => {
    expect(catalogIssues).toEqual([]);
  });

  it("covers both worlds and keeps every object sourced", () => {
    expect(catalog.objects.some((object) => object.planet === "moon")).toBe(true);
    expect(catalog.objects.some((object) => object.planet === "mars")).toBe(true);
    for (const object of catalog.objects) {
      expect(object.sources.length).toBeGreaterThan(0);
      expect(object.location.latitude).toBeGreaterThanOrEqual(-90);
      expect(object.location.longitude).toBeLessThanOrEqual(180);
    }
  });
});
