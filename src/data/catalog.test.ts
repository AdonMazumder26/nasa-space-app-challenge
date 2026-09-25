import { describe, expect, it } from "vitest";
import { catalog, catalogIssues } from "./catalog";

describe("catalog integrity", () => {
  it("has no validation issues", () => {
    expect(catalogIssues).toEqual([]);
  });

  it("covers both worlds and keeps every object sourced", () => {
    expect(catalog.objects.some((object) => object.planet === "moon")).toBe(true);
    expect(catalog.objects.some((object) => object.planet === "mars")).toBe(true);
    const pictured = [
      "apollo-11-descent-stage",
      "viking-1-lander",
      "viking-2-lander",
      "pathfinder-lander",
      "sojourner",
      "spirit",
      "opportunity",
      "phoenix",
      "curiosity",
      "insight",
      "perseverance",
      "beagle-2",
    ];
    for (const id of pictured) {
      const object = catalog.objects.find((item) => item.id === id);
      expect(object?.images).toHaveLength(1);
      expect(object?.images[0]?.url.startsWith("/images/")).toBe(true);
    }
    for (const object of catalog.objects) {
      expect(object.sources.length).toBeGreaterThan(0);
      expect(object.location.latitude).toBeGreaterThanOrEqual(-90);
      expect(object.location.longitude).toBeLessThanOrEqual(180);
    }
  });
});
