import { describe, expect, it } from "vitest";
import { emptyExploration } from "./exploration";
import { nextUnopenedSite, openedSiteCount, sitesForMission } from "./guidedExpedition";

const sites = [
  { id: "eagle", missionId: "apollo-11" },
  { id: "alsep-11", missionId: "apollo-11" },
  { id: "intrepid", missionId: "apollo-12" },
];

describe("guided expedition", () => {
  it("keeps only the chosen mission's documented sites", () => {
    expect(sitesForMission(sites, "apollo-11").map((site) => site.id)).toEqual(["eagle", "alsep-11"]);
  });

  it("suggests the first site whose story has not been opened", () => {
    const save = emptyExploration();
    save.records.eagle = { exploredAt: "2026-01-01T00:00:00.000Z" };
    expect(nextUnopenedSite(sitesForMission(sites, "apollo-11"), save)?.id).toBe("alsep-11");
    expect(openedSiteCount(sitesForMission(sites, "apollo-11"), save)).toBe(1);
  });
});
