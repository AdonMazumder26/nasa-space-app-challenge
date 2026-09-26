import { describe, expect, it } from "vitest";
import { discoveryAngle, moveExpeditionSite, pickDiscovery, scanAngle, sitesFacing, toggleExpeditionSite, viewLevel } from "./exploration";

describe("viewLevel", () => {
  it("stays global at the default camera distance", () => {
    expect(viewLevel(2.8, false)).toBe("global");
  });

  it("steps inward from region to site to artifact", () => {
    expect(viewLevel(2.2, false)).toBe("region");
    expect(viewLevel(1.6, false)).toBe("site");
    expect(viewLevel(1.6, true)).toBe("artifact");
  });
});

describe("discoveryAngle", () => {
  it("does not detect sites from the global view", () => {
    expect(discoveryAngle(2.8)).toBeNull();
  });

  it("tightens the cone as the camera approaches", () => {
    const far = discoveryAngle(2.4);
    const near = discoveryAngle(1.5);
    expect(far).not.toBeNull();
    expect(near).not.toBeNull();
    expect(near!).toBeLessThan(far!);
  });
});

const moonSites = [
  { id: "plain", planet: "moon" as const, missionId: "a", hasImage: false },
  { id: "pictured", planet: "moon" as const, missionId: "b", hasImage: true },
  { id: "mars-site", planet: "mars" as const, missionId: "c", hasImage: true },
];

describe("pickDiscovery", () => {
  it("stays on the current planet and prefers an undiscovered site", () => {
    const choice = pickDiscovery(moonSites, "moon", { plain: { exploredAt: "2026-09-26" } }, null, 0);
    expect(choice).toBe("pictured");
  });

  it("returns null once every site on that planet has been opened", () => {
    const records = { plain: { exploredAt: "2026-09-26" }, pictured: { exploredAt: "2026-09-26" } };
    expect(pickDiscovery(moonSites, "moon", records, null, 0)).toBeNull();
  });
});

describe("sitesFacing", () => {
  it("keeps the other planet out of a scan", () => {
    const hits = sitesFacing(
      [
        { id: "here", planet: "moon", latitude: 0, longitude: 0 },
        { id: "there", planet: "mars", latitude: 0, longitude: 0 },
        { id: "far", planet: "moon", latitude: 80, longitude: 0 },
      ],
      "moon",
      0,
      0,
      scanAngle(1.5),
    );
    expect(hits).toEqual(["here"]);
  });
});

describe("expedition edits", () => {
  it("adds, reorders, and removes a site", () => {
    const added = toggleExpeditionSite(undefined, "apollo-11");
    const second = toggleExpeditionSite(added, "surveyor-5");
    expect(second.artifactIds).toEqual(["apollo-11", "surveyor-5"]);
    expect(moveExpeditionSite(second, "surveyor-5", -1).artifactIds).toEqual(["surveyor-5", "apollo-11"]);
    expect(toggleExpeditionSite(second, "apollo-11").artifactIds).toEqual(["surveyor-5"]);
  });
});
